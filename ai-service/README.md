# FinNice AI Service

Small FastAPI app to serve the decision tree model for inference.

Endpoints:
- `GET /health` - health check
- `GET /metadata` - model metadata
- `POST /predict` - prediction. JSON body: `{ "features": [..] }` or `{ "named_features": {"feat1": val, ...} }`

Run locally:

```bash
python -m pip install -r requirements.txt
python app.py
```

The service listens on port 8001 by default.
