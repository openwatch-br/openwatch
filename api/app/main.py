import asyncio
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openwatch_config import settings
from openwatch_utils.logging import log, setup_logging
from sqlalchemy import text

from api.app.db import engine
from api.app.middleware.cache import CacheMiddleware
from api.app.middleware.pii_scrub import PIIScrubMiddleware
from api.app.middleware.rate_limit import RateLimitMiddleware
from api.app.middleware.security_events import SecurityEventsMiddleware
from api.app.routers.internal import router as internal_router
from api.app.routers.public import router as public_router
from api.core_client import CoreConflictError, CoreNotFoundError, CoreServiceError


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    app.state.redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    yield
    await app.state.redis.close()
    await engine.dispose()


_is_prod = settings.APP_ENV == "production"

app = FastAPI(
    title="OpenWatch",
    description="API pública para auditoria cidadã de dados federais",
    version="0.1.0",
    lifespan=lifespan,
    docs_url=None if _is_prod else "/docs",
    redoc_url=None if _is_prod else "/redoc",
    openapi_url=None if _is_prod else "/openapi.json",
)

_allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

# Innermost: scrub PII before any caching/logging sees the response body
app.add_middleware(PIIScrubMiddleware)
app.add_middleware(SecurityEventsMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(CacheMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(public_router, prefix="/public", tags=["public"])
app.include_router(internal_router, prefix="/internal", tags=["internal"])


@app.exception_handler(CoreNotFoundError)
async def core_not_found_handler(_: Request, exc: CoreNotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(CoreConflictError)
async def core_conflict_handler(_: Request, exc: CoreConflictError):
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(CoreServiceError)
async def core_service_error_handler(_: Request, exc: CoreServiceError):
    return JSONResponse(status_code=502, content={"detail": "Core service error", "message": str(exc)})


@app.get("/health")
async def health(request: Request):
    checks: dict[str, str] = {}
    healthy = True

    try:
        async with asyncio.timeout(2):
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        healthy = False
        checks["database"] = "error"
        log.warning("health_check_failed", check="database", error=str(exc))

    redis = getattr(request.app.state, "redis", None)
    if redis is not None:
        try:
            async with asyncio.timeout(2):
                await redis.ping()
            checks["redis"] = "ok"
        except Exception as exc:
            healthy = False
            checks["redis"] = "error"
            log.warning("health_check_failed", check="redis", error=str(exc))
    else:
        checks["redis"] = "unavailable"

    if not healthy:
        return JSONResponse(status_code=503, content={"status": "degraded", "checks": checks})
    return {"status": "ok", "checks": checks}
