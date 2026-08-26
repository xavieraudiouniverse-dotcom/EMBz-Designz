"""
Catch-all Vercel serverless function that delegates all /api/* requests
to the FastAPI application defined in backend/server.py.

Vercel's Python runtime invokes the `handler` class (extending
BaseHTTPRequestHandler) for each HTTP request.  This wrapper translates
between that synchronous interface and the async ASGI interface that
FastAPI expects.
"""

import os
import sys
import asyncio
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse

# ---------------------------------------------------------------------------
# Environment fallbacks – prevent KeyError at import time.
# The real values must be set as Vercel project environment variables.
# ---------------------------------------------------------------------------
os.environ.setdefault("MONGO_URL", os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
os.environ.setdefault("DB_NAME", os.environ.get("DB_NAME", "embz"))

# ---------------------------------------------------------------------------
# Make the backend/ directory importable.
# ---------------------------------------------------------------------------
_backend_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "backend",
)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Import the FastAPI ASGI app (this also imports merchize.py, stripe, etc.)
from server import app  # noqa: E402


# ---------------------------------------------------------------------------
# ASGI ↔ BaseHTTPRequestHandler adapter
# ---------------------------------------------------------------------------

class _ResponseCollector:
    """Accumulates the HTTP response emitted by the ASGI app."""

    def __init__(self):
        self.status = 200
        self.headers: list = []
        self._chunks: list = []

    @property
    def body(self) -> bytes:
        return b"".join(self._chunks)


def _invoke_asgi(method: str, raw_path: str, headers, body: bytes):
    """
    Call the FastAPI app for a single request.

    Returns (status_code, headers, body_bytes).
    """
    parsed = urlparse(raw_path)

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": method,
        "scheme": "https",
        "path": parsed.path,
        "raw_path": parsed.path.encode(),
        "query_string": parsed.query.encode(),
        "headers": [
            (k.lower().encode("latin-1"), v.encode("latin-1"))
            for k, v in headers
        ],
        "client": ("127.0.0.1", 0),
        "server": ("0.0.0.0", 443),
    }

    collector = _ResponseCollector()
    body_sent = [False]

    async def receive():
        if not body_sent[0]:
            body_sent[0] = True
            return {"type": "http.request", "body": body, "more_body": False}
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message):
        if message["type"] == "http.response.start":
            collector.status = message["status"]
            collector.headers = message.get("headers", [])
        elif message["type"] == "http.response.body":
            collector._chunks.append(message.get("body", b""))

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(app(scope, receive, send))
    finally:
        loop.close()

    return collector.status, collector.headers, collector.body


# ---------------------------------------------------------------------------
# Vercel handler
# ---------------------------------------------------------------------------

class handler(BaseHTTPRequestHandler):
    """Vercel Python serverless-function entry point."""

    # ----- helpers -------------------------------------------------------

    def _handle(self, method: str):
        # Read request body (if any)
        content_length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(content_length) if content_length > 0 else b""

        # Collect raw headers as (name, value) tuples
        headers = []
        for key in self.headers.keys():
            for value in self.headers.get_all(key):
                headers.append((key, value))

        try:
            status, resp_headers, resp_body = _invoke_asgi(
                method, self.path, headers, body
            )
        except Exception as exc:  # pragma: no cover  – safety net
            import json
            resp_body = json.dumps(
                {"detail": f"Internal server error: {exc}"}
            ).encode()
            status = 500
            resp_headers = [(b"content-type", b"application/json")]
            resp_body = resp_body

        # Send the response back to the client
        self.send_response(status)
        for raw_key, raw_val in resp_headers:
            k = raw_key.decode("latin-1") if isinstance(raw_key, bytes) else raw_key
            v = raw_val.decode("latin-1") if isinstance(raw_val, bytes) else raw_val
            # Skip hop-by-hop and length headers – we set Content-Length ourselves
            if k.lower() in ("transfer-encoding", "content-length", "content-encoding"):
                continue
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(resp_body)))
        self.end_headers()
        if resp_body and method != "HEAD":
            self.wfile.write(resp_body)

    # ----- HTTP method dispatch ------------------------------------------

    def do_GET(self):
        self._handle("GET")

    def do_POST(self):
        self._handle("POST")

    def do_PUT(self):
        self._handle("PUT")

    def do_DELETE(self):
        self._handle("DELETE")

    def do_PATCH(self):
        self._handle("PATCH")

    def do_OPTIONS(self):
        self._handle("OPTIONS")

    def do_HEAD(self):
        self._handle("HEAD")

    # Suppress default logging to keep the Vercel log clean
    def log_message(self, fmt, *args):
        pass
