"""PII scrubbing for public API responses (LGPD Art. 6º — minimização).

CPF is never exposed publicly: raw CPFs are masked to the Receita Federal
pattern (***XXXXXX**), hashes and internal keys are removed entirely.
Applied as middleware to every /public/* JSON response — defense in depth
over per-endpoint scrubbing, which proved leaky (only entity detail
scrubbed before this).
"""
from __future__ import annotations

import re
from typing import Any

# Keys removed wherever they appear (hashes / internal matching keys)
_DROP_KEYS = frozenset({"cpf_hash", "name_key"})

# Keys whose value is a CPF and must be masked
_CPF_KEYS = frozenset({"cpf", "cpf_partial"})

# 11-digit CPF (optionally punctuated) appearing in free-text identifier-ish
# fields. Word-boundary guarded so CNPJs (14 digits) and longer ids don't match.
_CPF_PATTERN = re.compile(r"(?<!\d)(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})(?!\d)")


def mask_cpf(value: str) -> str:
    """Mask a raw or partial CPF to the Receita pattern ***.XXX.XXX-**."""
    digits = re.sub(r"\D", "", value)
    if len(digits) == 11:
        return f"***.{digits[3:6]}.{digits[6:9]}-**"
    if len(digits) == 6:
        return f"***.{digits[:3]}.{digits[3:]}-**"
    return value


def _mask_cpf_in_text(text: str) -> str:
    return _CPF_PATTERN.sub(lambda m: f"***.{m.group(2)}.{m.group(3)}-**", text)


def scrub_pii(payload: Any, *, _key: str | None = None) -> Any:
    """Recursively scrub CPF PII from a JSON-shaped payload.

    - drops cpf_hash / name_key keys;
    - masks values under cpf / cpf_partial keys;
    - masks 11-digit CPF patterns inside string values of keys that look like
      identifier carriers (identifier, document, doc, ni) — free prose is
      left untouched to avoid mangling unrelated numbers.
    """
    if isinstance(payload, dict):
        return {
            k: scrub_pii(v, _key=k)
            for k, v in payload.items()
            if k not in _DROP_KEYS
        }
    if isinstance(payload, list):
        return [scrub_pii(item, _key=_key) for item in payload]
    if isinstance(payload, str):
        if _key in _CPF_KEYS:
            return mask_cpf(payload)
        if _key and any(t in _key.lower() for t in ("identifier", "document", "doc_", "_doc", "ni_fornecedor", "nifornecedor")):
            return _mask_cpf_in_text(payload)
        return payload
    return payload
