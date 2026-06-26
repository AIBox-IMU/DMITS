import os


def load_dotenv_file():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(base_dir, ".env")
    if not os.path.isfile(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and (key not in os.environ or os.environ.get(key, "") == ""):
                os.environ[key] = value


load_dotenv_file()


class Config:
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"
    HOST = os.getenv("HOST", "127.0.0.1").strip() or "127.0.0.1"
    PORT = int(os.getenv("PORT", "3000"))
    WAITRESS_THREADS = int(os.getenv("WAITRESS_THREADS", "8"))

    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "graph")

    LLM_API_URL = os.getenv("LLM_API_URL", "").strip()
    LLM_API_KEY = os.getenv("LLM_API_KEY", "").strip()
    LLM_MODEL = os.getenv("LLM_MODEL", "").strip()
    LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "30"))
