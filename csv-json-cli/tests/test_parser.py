"""Pytest suite for src/csv_to_json.py."""

import json
import subprocess
import sys
from pathlib import Path

import pytest

from csv_to_json import ConversionError, infer, parse_csv

SCRIPT = Path(__file__).resolve().parent.parent / "src" / "csv_to_json.py"


def run_cli(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=False,
    )


# --- parsing core -----------------------------------------------------------


def test_standard_comma_csv():
    text = "name,age,score\nAlice,30,9.5\nBob,25,8.0\n"
    assert parse_csv(text) == [
        {"name": "Alice", "age": 30, "score": 9.5},
        {"name": "Bob", "age": 25, "score": 8.0},
    ]


def test_semicolon_autodetect():
    assert parse_csv("a;b\n1;2\n") == [{"a": 1, "b": 2}]


def test_tab_autodetect():
    assert parse_csv("a\tb\n1\t2\n") == [{"a": 1, "b": 2}]


def test_pipe_autodetect():
    assert parse_csv("a|b|x\n1|2|3\n") == [{"a": 1, "b": 2, "x": 3}]


def test_explicit_delimiter_override():
    # Comma inside values must not split when pipe is forced.
    text = "name|note\nAlice|hello, world\n"
    assert parse_csv(text, delimiter="|") == [{"name": "Alice", "note": "hello, world"}]


def test_quoted_fields_with_commas_and_quotes():
    text = 'name,quote\nBob,"He said ""hi"", ok"\n'
    assert parse_csv(text) == [{"name": "Bob", "quote": 'He said "hi", ok'}]


def test_embedded_newlines_in_quoted_field():
    text = 'name,note\nAlice,"line1\nline2"\n'
    records = parse_csv(text)
    assert len(records) == 1
    assert records[0]["note"] == "line1\nline2"


def test_empty_file_returns_empty_array():
    assert parse_csv("") == []
    assert parse_csv("   \n\n") == []


def test_header_only_returns_empty_array():
    assert parse_csv("name,age,city\n") == []


def test_missing_trailing_values_padded_with_null():
    assert parse_csv("a,b,c\n1\n") == [{"a": 1, "b": None, "c": None}]


def test_empty_string_preserved_and_null_words_parsed():
    records = parse_csv("a,b,c\n,,NULL\n")
    assert records == [{"a": "", "b": "", "c": None}]


def test_unicode_cyrillic_and_emoji():
    text = "имя,note\nИван,😀 ok\nПривет,мир\n"
    assert parse_csv(text) == [
        {"имя": "Иван", "note": "😀 ok"},
        {"имя": "Привет", "note": "мир"},
    ]


def test_type_inference_numbers_bools_nulls():
    assert infer("42") == 42
    assert infer("-3.5") == -3.5
    assert infer("1e3") == 1000.0
    assert infer("TRUE") is True
    assert infer("false") is False
    assert infer("None") is None
    # Ambiguous values must stay text.
    assert infer("007") == "007"
    assert infer("1_2") == "1_2"
    assert infer("nan") == "nan"
    assert infer("inf") == "inf"
    assert infer("") == ""


def test_malformed_extra_field_raises():
    with pytest.raises(ConversionError):
        parse_csv("a,b\n1,2,3\n")


# --- CLI subprocess behaviour -----------------------------------------------


def test_cli_writes_pretty_json(tmp_path):
    inp = tmp_path / "in.csv"
    out = tmp_path / "out.json"
    inp.write_text("name,city\nИван,Київ\n", encoding="utf-8")
    result = run_cli("--input", str(inp), "--output", str(out), "--pretty")
    assert result.returncode == 0, result.stderr
    data = json.loads(out.read_text(encoding="utf-8"))
    assert data == [{"name": "Иван", "city": "Київ"}]
    assert "\n  " in out.read_text(encoding="utf-8")  # indented


def test_cli_compact_json_by_default(tmp_path):
    inp = tmp_path / "in.csv"
    out = tmp_path / "out.json"
    inp.write_text("a,b\n1,2\n", encoding="utf-8")
    result = run_cli("--input", str(inp), "--output", str(out))
    assert result.returncode == 0, result.stderr
    assert out.read_text(encoding="utf-8").strip() == '[{"a": 1, "b": 2}]'


def test_cli_empty_csv_writes_empty_array(tmp_path):
    inp = tmp_path / "in.csv"
    out = tmp_path / "out.json"
    inp.write_text("", encoding="utf-8")
    result = run_cli("--input", str(inp), "--output", str(out))
    assert result.returncode == 0, result.stderr
    assert json.loads(out.read_text(encoding="utf-8")) == []


def test_cli_missing_input_exits_1(tmp_path):
    missing = tmp_path / "nope.csv"
    out = tmp_path / "out.json"
    result = run_cli("--input", str(missing), "--output", str(out))
    assert result.returncode == 1
    assert "not found" in result.stderr


def test_cli_malformed_data_exits_1(tmp_path):
    inp = tmp_path / "in.csv"
    out = tmp_path / "out.json"
    inp.write_text("a,b\n1,2,3\n", encoding="utf-8")
    result = run_cli("--input", str(inp), "--output", str(out))
    assert result.returncode == 1
    assert "expected 2 fields" in result.stderr
