from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import joblib
import os
from fastapi.middleware.cors import CORSMiddleware

APP_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(APP_DIR, 'decision_tree_model.pkl')

app = FastAPI(title='FinNice AI Service', version='0.1')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    # Accept either a positional feature list or a mapping of feature_name->value
    features: Optional[List[float]] = None
    named_features: Optional[Dict[str, float]] = None


def load_model(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f'Model file not found: {path}')
    model = joblib.load(path)
    return model


MODEL = None
METADATA = {}


@app.on_event('startup')
def startup():
    global MODEL, METADATA
    try:
        MODEL = load_model(MODEL_PATH)
    except Exception as e:
        # Log and leave MODEL as None so service stays up for health checks
        print(f'Failed to load model: {e}')
        MODEL = None

    # basic metadata (safe when MODEL is None)
    if MODEL is None:
        METADATA = {'type': None, 'n_features_in_': None, 'n_outputs_': None, 'classes_': None, 'supports_predict_proba': False}
    else:
        classes = getattr(MODEL, 'classes_', None)
        try:
            classes_list = classes.tolist() if classes is not None else None
        except Exception:
            classes_list = None

        METADATA = {
            'type': MODEL.__class__.__name__,
            'n_features_in_': int(getattr(MODEL, 'n_features_in_', -1)),
            'n_outputs_': int(getattr(MODEL, 'n_outputs_', -1)),
            'classes_': classes_list,
            'supports_predict_proba': hasattr(MODEL, 'predict_proba'),
        }


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.get('/metadata')
def metadata():
    return {'success': True, 'metadata': METADATA}


@app.post('/predict')
def predict(req: PredictRequest):
    if MODEL is None:
        raise HTTPException(status_code=503, detail='Model not loaded')

    # Resolve feature vector
    if req.named_features is not None:
        # Try to use feature names from model if available
        feature_names = getattr(MODEL, 'feature_names_in_', None)
        if feature_names is None:
            # fallback: accept the values in insertion order
            vec = list(req.named_features.values())
        else:
            try:
                vec = [req.named_features[name] for name in feature_names]
            except KeyError as e:
                raise HTTPException(status_code=400, detail=f'Missing feature: {e}')
    elif req.features is not None:
        vec = req.features
    else:
        raise HTTPException(status_code=400, detail='No features provided')

    # Validate length
    expected = getattr(MODEL, 'n_features_in_', None)
    if expected is not None and len(vec) != expected:
        raise HTTPException(status_code=400, detail=f'feature vector length {len(vec)} does not match expected {expected}')

    import numpy as np
    arr = np.array(vec).reshape(1, -1)

    pred = MODEL.predict(arr)
    result: Dict[str, Any] = {'prediction': pred.tolist()}

    if hasattr(MODEL, 'predict_proba'):
        try:
            proba = MODEL.predict_proba(arr)
            result['probabilities'] = proba.tolist()
        except Exception:
            result['probabilities'] = None

    result['metadata'] = METADATA
    return {'success': True, 'data': result}


class AdviceRequest(BaseModel):
    budgets: Optional[List[Dict[str, Any]]] = None
    transactions: Optional[List[Dict[str, Any]]] = None
    locale: Optional[str] = 'id'


def build_advice(locale, budgets, transactions):
    # simple rule-based advice similar to frontend/backend fallback
    over = []
    near = []
    budgets = budgets or []
    transactions = transactions or []
    for b in budgets:
        spent = sum(
        float(t.get('amount', 0) or 0)
        for t in transactions
        if t.get('type') == 'expense'
        and t.get('category') == b.get('category')
    )

    try:
        limit = float(b.get('limit', 0) or 0)
    except (ValueError, TypeError):
        limit = 0

    percent = (spent / limit) * 100 if limit > 0 else 0

    if spent > limit:
        over.append({
            **b,
            'spent': spent,
            'percent': percent
        })
    elif percent >= 80:
        near.append({
            **b,
            'spent': spent,
            'percent': percent
        })

    total_income = sum(
        float(t.get('amount', 0) or 0)
        for t in transactions
        if t.get('type') == 'income'
    )

    total_expense = sum(
        float(t.get('amount', 0) or 0)
        for t in transactions
        if t.get('type') == 'expense'
    )
    savings = total_income - total_expense
    savings_percent = (savings / total_income) * 100 if total_income > 0 else 0

    # build advice text
    if len(over) > 0:
        cats = ', '.join([b.get('category') for b in over])
        return {
            'type': 'danger',
            'text': '⚠️ Perhatian! Budget %s sudah melebihi batas.' % cats if locale == 'id' else '⚠️ Warning! Budget %s is already over the limit.' % cats,
            'suggestion': 'Coba kurangi pengeluaran di kategori ini atau sesuaikan budget.' if locale == 'id' else 'Try reducing spending in these categories or adjust the budget.'
        }, {'totalIncome': total_income, 'totalExpense': total_expense, 'savings': savings, 'savingsPercent': savings_percent, 'overBudgetItems': over, 'nearLimitItems': near}

    if len(near) > 0:
        cats = ', '.join([b.get('category') for b in near])
        return {
            'type': 'warning',
            'text': '📊 Pengeluaran %s sudah mendekati batas.' % cats if locale == 'id' else '📊 Spending for %s is approaching the limit.' % cats,
            'suggestion': 'Pantau pengeluaran di kategori ini agar tidak over budget.' if locale == 'id' else 'Keep an eye on these categories so they do not go over budget.'
        }, {'totalIncome': total_income, 'totalExpense': total_expense, 'savings': savings, 'savingsPercent': savings_percent, 'overBudgetItems': over, 'nearLimitItems': near}

    if savings < 0:
        return {
            'type': 'danger',
            'text': '⚠️ Pengeluaran melebihi pemasukan sebesar Rp %s.' % (abs(savings)) if locale == 'id' else '⚠️ Spending is above income by Rp %s.' % (abs(savings)),
            'suggestion': 'Segera evaluasi pengeluaranmu.' if locale == 'id' else 'Review your expenses as soon as possible.'
        }, {'totalIncome': total_income, 'totalExpense': total_expense, 'savings': savings, 'savingsPercent': savings_percent, 'overBudgetItems': over, 'nearLimitItems': near}

    if 0 < savings_percent < 20:
        return {
            'type': 'warning',
            'text': '💡 Tabungan hanya %d%% dari pemasukan.' % round(savings_percent) if locale == 'id' else '💡 Savings are only %d%% of income.' % round(savings_percent),
            'suggestion': 'Targetkan minimal 20% untuk tabungan.' if locale == 'id' else 'Target at least 20% of your income for savings.'
        }, {'totalIncome': total_income, 'totalExpense': total_expense, 'savings': savings, 'savingsPercent': savings_percent, 'overBudgetItems': over, 'nearLimitItems': near}

    if savings >= 0:
        return {
            'type': 'success',
            'text': '🎉 Bagus! Kamu menabung Rp %s bulan ini.' % (savings) if locale == 'id' else '🎉 Nice! You saved Rp %s this month.' % (savings),
            'suggestion': 'Pertahankan kebiasaan baik ini.' if locale == 'id' else 'Keep up the good habit.'
        }, {'totalIncome': total_income, 'totalExpense': total_expense, 'savings': savings, 'savingsPercent': savings_percent, 'overBudgetItems': over, 'nearLimitItems': near}

    return {
        'type': 'info',
        'text': '🤖 Saya siap membantu menganalisis keuanganmu.' if locale == 'id' else '🤖 I am ready to help analyze your finances.',
        'suggestion': 'Tambah transaksi dan budget untuk saran yang lebih akurat.' if locale == 'id' else 'Add more transactions and budgets for more accurate advice.'
    }, {'totalIncome': total_income, 'totalExpense': total_expense, 'savings': savings, 'savingsPercent': savings_percent, 'overBudgetItems': over, 'nearLimitItems': near}


@app.post('/advice')
def advice_endpoint(req: AdviceRequest):
    budgets = req.budgets or []
    transactions = req.transactions or []
    locale = req.locale or 'id'

    advice, summary = build_advice(locale, budgets, transactions)
    return {'success': True, 'data': {'advice': advice, 'summary': summary}}


if __name__ == '__main__':
    import uvicorn
    # Allow overriding host/port via environment variables to avoid port conflicts
    host = os.environ.get('AI_SERVICE_HOST', os.environ.get('HOST', '0.0.0.0'))
    port = int(os.environ.get('AI_SERVICE_PORT', os.environ.get('PORT', 8001)))
    uvicorn.run(app, host=host, port=port)
