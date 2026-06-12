"""Admin kill-switch CLI."""

from karl_twin.admin.__main__ import main as admin_main, PAUSE_FLAG


def test_pause_creates_flag():
    if PAUSE_FLAG.exists():
        PAUSE_FLAG.unlink()
    rc = admin_main(["pause"])
    assert rc == 0
    assert PAUSE_FLAG.exists()


def test_resume_removes_flag():
    PAUSE_FLAG.parent.mkdir(parents=True, exist_ok=True)
    PAUSE_FLAG.write_text("paused")
    rc = admin_main(["resume"])
    assert rc == 0
    assert not PAUSE_FLAG.exists()


def test_status_runs_clean(capsys):
    rc = admin_main(["status"])
    assert rc == 0
    out = capsys.readouterr().out
    assert "paused:" in out


def test_doctor_reports_ollama_ready(monkeypatch, capsys):
    class TagsResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {"models": [{"name": "qwen-test"}]}

    class ChatResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {"message": {"content": "OK"}}

    monkeypatch.setenv("KARL_TWIN_PROVIDER", "ollama")
    monkeypatch.setenv("OLLAMA_MODEL", "qwen-test")
    monkeypatch.setattr("karl_twin.admin.__main__.httpx.get", lambda *a, **kw: TagsResponse())
    monkeypatch.setattr("karl_twin.admin.__main__.httpx.post", lambda *a, **kw: ChatResponse())

    rc = admin_main(["doctor"])

    assert rc == 0
    out = capsys.readouterr().out
    assert "Karl setup doctor" in out
    assert "OK   ollama_model_downloaded" in out
    assert "OK   ollama_model_generates" in out


def test_doctor_fails_when_ollama_model_missing(monkeypatch, capsys):
    class R:
        def raise_for_status(self):
            pass

        def json(self):
            return {"models": [{"name": "other-model"}]}

    monkeypatch.setenv("KARL_TWIN_PROVIDER", "ollama")
    monkeypatch.setenv("OLLAMA_MODEL", "qwen-test")
    monkeypatch.setattr("karl_twin.admin.__main__.httpx.get", lambda *a, **kw: R())

    rc = admin_main(["doctor"])

    assert rc == 1
    out = capsys.readouterr().out
    assert "FAIL ollama_model_downloaded" in out


def test_doctor_fails_when_ollama_generation_fails(monkeypatch, capsys):
    class TagsResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return {"models": [{"name": "qwen-test"}]}

    def fail_post(*_args, **_kwargs):
        raise RuntimeError("model load failed")

    monkeypatch.setenv("KARL_TWIN_PROVIDER", "ollama")
    monkeypatch.setenv("OLLAMA_MODEL", "qwen-test")
    monkeypatch.setattr("karl_twin.admin.__main__.httpx.get", lambda *a, **kw: TagsResponse())
    monkeypatch.setattr("karl_twin.admin.__main__.httpx.post", fail_post)

    rc = admin_main(["doctor"])

    assert rc == 1
    out = capsys.readouterr().out
    assert "FAIL ollama_model_generates" in out
