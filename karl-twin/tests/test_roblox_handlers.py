"""Tests for Roblox pipeline handlers (no rojo binary required for write sandbox)."""

from __future__ import annotations

import os
from pathlib import Path

import pytest

from karl_twin.worker.roblox_handlers import game_luau_write, _game_root


@pytest.fixture
def game_root(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    monkeypatch.setenv("GAME_ROOT", str(tmp_path))
    (tmp_path / "ReplicatedStorage").mkdir(parents=True)
    return tmp_path


def test_game_root_env(game_root: Path) -> None:
    assert _game_root() == game_root.resolve()


def test_game_luau_write_sandbox(game_root: Path) -> None:
    rel = "ReplicatedStorage/TestModule.luau"
    game_luau_write({"path": rel, "content": "return { ok = true }\n"})
    target = game_root / rel
    assert target.is_file()
    assert "ok = true" in target.read_text(encoding="utf-8")


def test_game_luau_write_rejects_escape(game_root: Path) -> None:
    with pytest.raises(PermissionError):
        game_luau_write({"path": "../../../etc/passwd.luau", "content": "x"})


def test_game_luau_write_requires_luau_extension(game_root: Path) -> None:
    with pytest.raises(ValueError):
        game_luau_write({"path": "bad.txt", "content": "x"})
