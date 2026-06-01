# FinNice AI Service

Small FastAPI app to serve the decision tree model for inference.

Endpoints:
- `GET /health` - health check
- `GET /metadata` - model metadata
- `POST /predict` - prediction. JSON body: `{ "features": [..] }` or `{ "named_features": {"feat1": val, ...} }`

Running on a different port
---------------------------
If port 8001 is already in use you can run the AI service on an alternative port by setting the `AI_SERVICE_PORT` or `PORT` environment variable before starting the app. Examples:

Windows (PowerShell):

```powershell
$env:AI_SERVICE_PORT = '8002'
python app.py
```

Linux / macOS:

```bash
AI_SERVICE_PORT=8002 python app.py
```

You can also override the host with `AI_SERVICE_HOST` if needed.

Run locally:

```bash
python -m pip install -r requirements.txt
python app.py
```

The service listens on port 8001 by default.
