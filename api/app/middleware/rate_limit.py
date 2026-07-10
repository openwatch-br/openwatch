import time

from openwatch_config import settings
from openwatch_utils.logging import log
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from api.app.utils.net import get_client_ip as _client_ip


async def _check_rate_limit(redis, key: str, burst: int) -> bool:
    """Sliding-window counter. Returns True if the request should be blocked."""
    now_ms = int(time.time() * 1000)
    window_ms = 1000

    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, now_ms - window_ms)
    pipe.zcard(key)
    pipe.zadd(key, {str(now_ms): now_ms})
    pipe.expire(key, 2)

    try:
        results = await pipe.execute()
        return results[1] >= burst
    except Exception as exc:
        log.warning("redis_unavailable", where="rate_limit", key=key, error=str(exc))
        return False  # Redis down → allow


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Redis sliding-window rate limiter.

    - /public/*   — keyed on real client IP, PUBLIC_RATE_LIMIT_BURST per second.
    - /internal/* — keyed on X-Internal-Api-Key, INTERNAL_RATE_LIMIT_BURST per second.
    - All other paths pass through unthrottled.
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        redis = getattr(request.app.state, "redis", None)

        if path.startswith("/public"):
            if redis is not None:
                ip = _client_ip(request)
                blocked = await _check_rate_limit(
                    redis,
                    f"ratelimit:public:{ip}",
                    settings.PUBLIC_RATE_LIMIT_BURST,
                )
                if blocked:
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Too many requests"},
                        headers={"Retry-After": "1"},
                    )

        elif path.startswith("/internal") and redis is not None:
            api_key = request.headers.get("X-Internal-Api-Key", "anonymous")
            blocked = await _check_rate_limit(
                redis,
                f"ratelimit:internal:{api_key}",
                settings.INTERNAL_RATE_LIMIT_BURST,
            )
            if blocked:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests"},
                    headers={"Retry-After": "1"},
                )

        return await call_next(request)
