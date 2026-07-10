"""Internal operator endpoints — proxied to openwatch-core.

These routes are only intended for the operator dashboard.
Authentication is enforced via verify_internal_key (X-Internal-Api-Key),
and the rate-limit middleware also keys them on X-Internal-Api-Key.
"""
from fastapi import APIRouter, Depends

from api.app.dependencies import verify_internal_key
from api.core_client import CoreClient

router = APIRouter(dependencies=[Depends(verify_internal_key)])


def _client() -> CoreClient:
    return CoreClient()


@router.get("/pipeline/status")
async def pipeline_status():
    return await _client().get_pipeline_status()


@router.get("/pipeline/capacity")
async def pipeline_capacity():
    return await _client().get_pipeline_capacity()


@router.post("/pipeline/full")
async def trigger_full_pipeline():
    return await _client().trigger_full_pipeline()


@router.post("/pipeline/dispatch-next")
async def dispatch_next_pending():
    return await _client().dispatch_next_pending()


@router.post("/ingest/{connector}/yield")
async def yield_connector(connector: str):
    return await _client().yield_connector(connector)
