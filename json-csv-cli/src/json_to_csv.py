#!/usr/bin/env python3
"""Convert a JSON file containing an array of flat objects to CSV.

Missing keys in any object are filled with an empty string.
Column order follows first-seen key order across all objects.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path


def json_to_rows(records: list[dict]) -> tuple[list[str], list[list[str]]]:
    """Return (header, rows) for a list of flat JSON objects."""
    fieldnames: list[str] = []
    for record in records:
        if not isinstance(record, dict):
            raise TypeError(f"Expected JSON object, got {type(record).__name__}")
        for key in record:
            if key not in fieldnames:
                fieldnames.append(key)

    def cell(value: object) -> str:
        if value is None:
            return ""
        if isinstance(value, (dict, list)):
            return json.dumps(value, ensure_ascii=False)
        return str(value)

    rows = [[cell(record.get(name, "")) for name in fieldnames] for record in records]
    return fieldnames, rows


def convert(input_path: Path, output_path: Path) -> None:
    try:
        data = json.loads(input_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {input_path}: {exc}") from exc
    if not isinstance(data, list):
        raise SystemExit(f"{input_path}: top-level JSON value must be an array")

    records = [r for r in data if r is not None]
    try:
        fieldnames, rows = json_to_rows(records)
    except TypeError as exc:
        raise SystemExit(f"{input_path}: {exc}") from exc

    # Empty input produces an empty CSV file (no header row).
    if not fieldnames:
        output_path.write_text("", encoding="utf-8")
        return

    with output_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(fieldnames)
        writer.writerows(rows)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Convert a JSON array of flat objects to CSV.")
    parser.add_argument("--input", required=True, type=Path, help="Path to the input JSON file")
    parser.add_argument("--output", required=True, type=Path, help="Path to the output CSV file")
    args = parser.parse_args(argv)

    if not args.input.is_file():
        raise SystemExit(f"Input file not found: {args.input}")
    convert(args.input, args.output)
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
