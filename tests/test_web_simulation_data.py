"""Keep independently deployable browser fixtures aligned with the original simulator."""

import json
from pathlib import Path

import pytest

from app.services.scoring import score_incident

ROOT = Path(__file__).resolve().parents[1]


@pytest.mark.parametrize("name", ["sample_alerts", "sample_assets", "sample_users", "sample_ip_reputation", "sample_playbooks"])
def test_browser_fixtures_match_source(name):
    source = json.loads((ROOT / "data" / f"{name}.json").read_text(encoding="utf-8"))
    browser = json.loads((ROOT / "training/app/simulation-data" / f"{name}.json").read_text(encoding="utf-8"))
    assert browser == source


def test_seed_priorities_match_browser_expected_results():
    alerts = json.loads((ROOT / "data/sample_alerts.json").read_text(encoding="utf-8"))
    actual = [score_incident(a["incident"]["severity"], a["incident"]["confidence"], a["enrichment"]["asset_criticality"], a["enrichment"]["account_type"])["priority"] for a in alerts]
    assert actual == ["P1", "P2", "P4", "P1", "P4", "P3"]
