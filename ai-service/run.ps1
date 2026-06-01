param([string]$port = '8001')

# Activate virtualenv and run app.py with AI_SERVICE_PORT set
$env:AI_SERVICE_PORT = $port
Write-Host "Starting AI service on port $port (AI_SERVICE_PORT)"

# Activate virtual environment if present
$venv = Join-Path $PSScriptRoot ".venv\Scripts\Activate.ps1"
if (Test-Path $venv) {
    & $venv
}

python app.py
