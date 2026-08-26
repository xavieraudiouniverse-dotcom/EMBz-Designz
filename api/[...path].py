"""
Catch-all Vercel serverless function that delegates all /api/* requests
to the FastAPI application defined in backend/server.py.

Vercel's Python runtime natively supports FastAPI/ASGI apps — it detects
the `app` variable exported from this file and invokes it directly.
"""

import os
import sys

# ---------------------------------------------------------------------------
# Environment fallbacks – prevent KeyError at import time.
# The real values must be set as Vercel project environment variables.
# ---------------------------------------------------------------------------
os.environ.setdefault("MONGO_URL", os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
os.environ.setdefault("DB_NAME", os.environ.get("DB_NAME", "embz"))

# ---------------------------------------------------------------------------
# Make the backend/ directory importable so `from server import app` works.
# ---------------------------------------------------------------------------
_backend_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "backend",
)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Export the FastAPI ASGI app — Vercel detects this automatically.
from server import app  # noqa: E402,F401
