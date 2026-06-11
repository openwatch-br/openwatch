import json

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from api.app.utils.pii import scrub_pii


class PIIScrubMiddleware(BaseHTTPMiddleware):
    """Scrub CPF PII from every /public/* JSON response (LGPD minimização).

    Must be the innermost middleware (added first) so CacheMiddleware stores
    already-scrubbed bodies and no path can bypass the scrub.
    """

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if not request.url.path.startswith("/public"):
            return response
        if response.status_code != 200:
            return response
        if "application/json" not in (response.headers.get("content-type") or ""):
            return response

        body = b""
        async for chunk in response.body_iterator:
            body += chunk if isinstance(chunk, bytes) else chunk.encode()

        try:
            payload = json.loads(body)
        except (ValueError, UnicodeDecodeError):
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type,
            )

        scrubbed = json.dumps(scrub_pii(payload), ensure_ascii=False).encode()
        headers = dict(response.headers)
        headers.pop("content-length", None)
        return Response(
            content=scrubbed,
            status_code=response.status_code,
            headers=headers,
            media_type="application/json",
        )
