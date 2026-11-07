#!/usr/bin/env python3
"""Convert a CSV file into a JSON array of objects (RFC 4180, UTF-8)."""

from __future__ import annotations

import argparse
import csv
import io
import json
import math
import sys
from pathlib import Path

DELIMITERS = ",;\t|"
NULL_WORDS = {"null", "none"}
BOOL_WORDS = {"true": True, "false": False}


class ConversionError(Exception):
    """Raised for malformed CSV data that cannot be converted safely."""


def infer(raw: str) -> object:
    """Coerce a field to int/float/bool/null when unambiguous, else keep text."""
    s = raw.strip()
    low = s.lower()
    if low in NULL_WORDS:
        return None
    if low in BOOL_WORDS:
        return BOOL_WORDS[low]
    try:
        number = int(s)
    except ValueError:
        pass
    else:
        # str(number) != s protects leading zeros (IDs), underscores, "+5".
        return number if str(number) == s else raw
    try:
        value = float(s)
    except ValueError:
        return raw
    if math.isfinite(value) and ("." in s or "e" in low):
        return value
    return raw


def detect_delimiter(text: str) -> str:
    """Sniff the delimiter from common candidates, defaulting to comma."""
    sample = "\n".join(text.splitlines()[:50])[:8192]
    try:
        return csv.Sniffer().sniff(sample, delimiters=DELIMITERS).delimiter
    except csv.Error:
        return ","


def parse_csv(text: str, delimiter: str | None = None) -> list[dict]:
    """Parse CSV text into a list of dicts with inferred value types."""
    if not text.strip():
        return []
    delim = delimiter or detect_delimiter(text)
    try:
        reader = csv.reader(io.StringIO(text), delimiter=delim)
        rows = [row for row in reader if any(cell.strip() for cell in row)]
    except csv.Error as exc:
        raise ConversionError(f"malformed CSV data: {exc}") from exc
    if not rows:
        return []
    header, *data_rows = rows
    records = []
    for lineno, row in enumerate(data_rows, start=2):
        if len(row) > len(header):
            raise ConversionError(
                f"line {lineno}: expected {len(header)} fields, got {len(row)}"
            )
        values = [infer(cell) for cell in row]
        missing = [None] * (len(header) - len(row))
        records.append(dict(zip(header, values + missing)))
    return records


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Convert a CSV file into a JSON array of objects."
    )
    parser.add_argument(
        "--input", required=True, type=Path, help="path to the source CSV file"
    )
    parser.add_argument(
        "--output", required=True, type=Path, help="path for the generated JSON file"
    )
    parser.add_argument(
        "--pretty", action="store_true", help="write indented, human-readable JSON"
    )
    parser.add_argument(
        "--delimiter",
        choices=list(DELIMITERS),
        help="override the auto-detected delimiter (default: auto)",
    )
    args = parser.parse_args(argv)

    def fail(message: str) -> int:
        print(f"error: {message}", file=sys.stderr)
        return 1

    try:
        text = args.input.read_text(encoding="utf-8-sig")
    except FileNotFoundError:
        return fail(f"input file not found: {args.input}")
    except UnicodeDecodeError:
        return fail(f"input file is not valid UTF-8: {args.input}")
    except OSError as exc:
        return fail(f"cannot read input file: {exc}")

    try:
        records = parse_csv(text, args.delimiter)
    except ConversionError as exc:
        return fail(str(exc))

    indent = 2 if args.pretty else None
    try:
        with args.output.open("w", encoding="utf-8") as fh:
            json.dump(records, fh, ensure_ascii=False, indent=indent)
            fh.write("\n")
    except OSError as exc:
        return fail(f"cannot write output file: {exc}")

    print(f"Wrote {len(records)} record(s) to {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
