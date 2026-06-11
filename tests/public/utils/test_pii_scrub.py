"""LGPD: nenhum CPF completo pode sobreviver ao scrub de respostas públicas."""
import json
import re

from api.app.utils.pii import mask_cpf, scrub_pii

_FULL_CPF = re.compile(r"(?<!\d)\d{3}\.?\d{3}\.?\d{3}-?\d{2}(?!\d)")


def test_mask_cpf_full():
    assert mask_cpf("52998224725") == "***.982.247-**"
    assert mask_cpf("529.982.247-25") == "***.982.247-**"


def test_mask_cpf_partial_six_digits():
    assert mask_cpf("982247") == "***.982.247-**"


def test_scrub_drops_hashes_and_masks_cpf():
    payload = {
        "entity": {
            "name": "FULANO DE TAL",
            "identifiers": {
                "cpf": "52998224725",
                "cpf_hash": "abc123",
                "cpf_partial": "***982247**",
                "cnpj": "11222333000181",
                "name_key": "fulano|tal",
            },
        },
        "nodes": [
            {"attrs": {"cpf": "529.982.247-25"}},
        ],
    }
    out = scrub_pii(payload)
    identifiers = out["entity"]["identifiers"]
    assert "cpf_hash" not in identifiers
    assert "name_key" not in identifiers
    assert identifiers["cpf"] == "***.982.247-**"
    assert identifiers["cpf_partial"] == "***.982.247-**"
    assert identifiers["cnpj"] == "11222333000181"  # CNPJ é público — intacto
    assert out["nodes"][0]["attrs"]["cpf"] == "***.982.247-**"


def test_scrub_masks_cpf_in_identifier_fields():
    payload = {"identifier": "CPF 529.982.247-25 do fornecedor", "niFornecedor": "52998224725"}
    out = scrub_pii(payload)
    assert "982.247" in out["identifier"]
    assert not _FULL_CPF.search(out["identifier"])
    assert out["niFornecedor"] == "***.982.247-**" or not _FULL_CPF.search(out["niFornecedor"])


def test_scrub_leaves_prose_and_cnpj_alone():
    payload = {
        "summary": "Contrato de R$ 12345678901 com vencedor único",
        "cnpj": "11.222.333/0001-81",
    }
    out = scrub_pii(payload)
    assert out["summary"] == payload["summary"]
    assert out["cnpj"] == payload["cnpj"]


def test_no_full_cpf_survives_anywhere():
    payload = {
        "deep": [{"nested": {"identifiers": {"cpf": "52998224725"}}}],
        "list": [{"cpf": "39053344705"}],
    }
    text = json.dumps(scrub_pii(payload))
    assert not _FULL_CPF.search(text)
