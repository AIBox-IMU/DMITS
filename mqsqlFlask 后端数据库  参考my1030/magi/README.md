# Math System (Flask)

## Environment

- Python 3.9+
- MySQL 5.7+ / 8.x

## Install

```bash
pip install -r requirements.txt
```

## Run

Local development:

```bash
python app.py
```

Production-like startup:

```bash
python run_server.py
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## APIs

- `GET/POST /api/graph` returns `{ code, message, data: { nodes, links } }`
- `GET/POST /GETJSON` and `GET/POST /getJSON` keep legacy compatibility

## Notes

- Since the self-developed model has not yet been recorded, it is not publicly available.
