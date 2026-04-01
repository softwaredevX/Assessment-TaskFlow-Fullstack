from fastapi import FastAPI
from core.config import settings
from core.logging import configure_logging, get_logger
from api.v1.endpoints import auth, boards, lists, cards
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError


configure_logging()
logger = get_logger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth, prefix="/api/v1")
app.include_router(boards, prefix="/api/v1")
app.include_router(lists, prefix="/api/v1")
app.include_router(cards, prefix="/api/v1")

@app.on_event("startup")
async def on_startup() -> None:
    logger.info("TaskFlow API starting up — project: %s", settings.PROJECT_NAME)


@app.get("/health")
async def health_check():
    logger.debug("Health check requested")
    return {"status": "ok"}
