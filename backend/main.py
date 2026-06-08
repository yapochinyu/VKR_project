from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import STATIC_DIR
from backend.database import get_all_scientific_names
from backend.ml.inference import get_class_names
from backend.routers import plants, recognize


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        db_names = get_all_scientific_names()
        model_names = set(get_class_names())
        missing = model_names - db_names
        if missing:
            print(f"WARNING: классы модели отсутствуют в БД: {missing}")
    except FileNotFoundError as exc:
        print(f"WARNING: {exc}")
    except Exception as exc:
        print(f"WARNING: не удалось проверить модель при старте: {exc}")
    yield


app = FastAPI(title="flwrr API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.include_router(plants.router)
app.include_router(recognize.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
