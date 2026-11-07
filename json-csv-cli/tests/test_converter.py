import csv
import json
import subprocess
import sys
from pathlib import Path

import pytest

SRC = Path(__file__).resolve().parent.parent / "src"
sys.path.insert(0, str(SRC))

from json_to_csv import convert  # noqa: E402


def run_convert(tmp_path: Path, raw_json: str, name: str = "data.csv") -> list[list[str]]:
    inp = tmp_path / "data.json"
    out = tmp_path / name
    inp.write_text(raw_json, encoding="utf-8")
    convert(inp, out)
    text = out.read_text(encoding="utf-8")
    if not text:
        return []
    return list(csv.reader(text.splitlines(keepends=True)))


def test_empty_array(tmp_path):
    assert run_convert(tmp_path, "[]") == []


def test_normal_conversion(tmp_path):
    rows = run_convert(tmp_path, '[{"a": 1, "b": 2}, {"a": 3, "b": 4}]')
    assert rows == [["a", "b"], ["1", "2"], ["3", "4"]]


def test_missing_keys_filled_with_empty_string(tmp_path):
    rows = run_convert(tmp_path, '[{"a": 1, "b": 2}, {"a": 3}, {"b": 9}]')
    assert rows == [["a", "b"], ["1", "2"], ["3", ""], ["", "9"]]


def test_null_values_become_empty_string(tmp_path):
    rows = run_convert(tmp_path, '[{"a": null, "b": 1}]')
    assert rows == [["a", "b"], ["", "1"]]


def test_commas_and_quotes_are_escaped(tmp_path):
    rows = run_convert(tmp_path, '[{"msg": "hello, \\"world\\""}]')
    assert rows == [["msg"], ['hello, "world"']]


def test_newlines_inside_values_round_trip(tmp_path):
    raw = json.dumps({"note": "line1\nline2"})
    rows = run_convert(tmp_path, f"[{raw}]")
    assert rows == [["note"], ["line1\nline2"]]


def test_unicode_special_characters(tmp_path):
    raw = json.dumps({"city": "Київ", "emoji": "🚀"}, ensure_ascii=False)
    rows = run_convert(tmp_path, f"[{raw}]")
    assert rows == [["city", "emoji"], ["Київ", "🚀"]]


def test_invalid_json_exits(tmp_path):
    inp = tmp_path / "bad.json"
    inp.write_text("{not json", encoding="utf-8")
    with pytest.raises(SystemExit):
        convert(inp, tmp_path / "out.csv")


def test_non_array_root_exits(tmp_path):
    inp = tmp_path / "obj.json"
    inp.write_text('{"a": 1}', encoding="utf-8")
    with pytest.raises(SystemExit):
        convert(inp, tmp_path / "out.csv")


def test_cli_end_to_end(tmp_path):
    inp = tmp_path / "in.json"
    out = tmp_path / "out.csv"
    inp.write_text('[{"x": "1,2"}]', encoding="utf-8")
    subprocess.run(
        [sys.executable, str(SRC / "json_to_csv.py"), "--input", str(inp), "--output", str(out)],
        check=True,
    )
    assert list(csv.reader(out.read_text(encoding="utf-8").splitlines())) == [["x"], ["1,2"]]
