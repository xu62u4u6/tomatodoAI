from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import create_db_and_tables
from .routers import chat, settings, tasks


app = FastAPI(title="TomatodoAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(tasks.router)
app.include_router(chat.router)
app.include_router(settings.router)
