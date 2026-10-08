"""Serve the repo for frame-checking the films (PO tooling; nothing on disk changes).

    python po/tools/film_stills/serve.py <repo> <port> [<hook.js>]

Serves <repo> like `python -m http.server`, but appends <hook.js> (default: hook.js beside this file) to app.js as
it is served, so the hook runs in the module's own scope. POST /__save?name=<file> writes the request body to
$TEMP/aevi_stills/<file>, so a page can save a frame or a contact sheet without a download prompt.
"""
import http.server, os, sys, urllib.parse

ROOT = sys.argv[1]
PORT = int(sys.argv[2])
HOOK = open(sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "hook.js"), "rb").read()


class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json"}

    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] == "/app.js":
            body = open(os.path.join(ROOT, "app.js"), "rb").read() + b"\n" + HOOK
            self.send_response(200)
            self.send_header("Content-Type", "text/javascript; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

    def do_POST(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        name = os.path.basename(q.get("name", ["still.bin"])[0])
        out = os.path.join(os.environ.get("TEMP", os.environ.get("TMPDIR", ".")), "aevi_stills")
        os.makedirs(out, exist_ok=True)
        body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
        open(os.path.join(out, name), "wb").write(body)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(str(len(body)).encode())


http.server.ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
