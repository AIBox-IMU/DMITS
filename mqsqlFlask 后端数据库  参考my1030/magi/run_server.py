from app import app

try:
    from waitress import serve
except ImportError as exc:
    raise SystemExit(
        "waitress is not installed. Run `pip install -r requirements.txt` first."
    ) from exc


def main():
    host = app.config.get("HOST", "0.0.0.0")
    port = int(app.config.get("PORT", 3000))
    threads = int(app.config.get("WAITRESS_THREADS", 8))

    print(f"Serving on http://{host}:{port} with waitress ({threads} threads)")
    serve(app, host=host, port=port, threads=threads)


if __name__ == "__main__":
    main()
