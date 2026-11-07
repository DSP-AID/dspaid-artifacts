# csv_to_json

Dependency-free Python 3.10+ command-line script that converts a CSV file
into a JSON file containing an array of objects (one object per data row,
keyed by the header columns).

## Requirements

- Python 3.10 or newer (standard library only — no third-party packages).

## Usage

```bash
python src/csv_to_json.py --input data.csv --output data.json
python src/csv_to_json.py --input data.csv --output data.json --pretty
python src/csv_to_json.py --input data.tsv --output data.json --delimiter "\t"
```

## CLI arguments

| Flag          | Required | Description                                             |
|---------------|----------|---------------------------------------------------------|
| `--input`     | yes      | Path to the source CSV file.                            |
| `--output`    | yes      | Path for the generated JSON file.                       |
| `--pretty`    | no       | Write indented, human-readable JSON (2-space indent).   |
| `--delimiter` | no       | Force a delimiter (`,` `;` tab `|`). Default: auto-detect. |

## Behavior

- **Delimiter auto-detection** — sniffs comma, semicolon, tab and pipe from
  the first lines of the file; falls back to comma. Override with
  `--delimiter` when detection is unwanted.
- **RFC 4180 quoting** — quoted fields may contain delimiters, doubled
  quotes (`""` → `"`) and embedded newlines.
- **Full UTF-8 / Unicode** — Cyrillic, emoji and other non-ASCII text are
  written as-is (no `\uXXXX` escaping). A UTF-8 BOM is accepted and stripped.
- **Empty input** — an empty file or a header-only file produces `[]`.
- **Type inference** — values are converted when unambiguous:
  - integers (`42`, `-7`) and floats (`3.14`, `1e3`);
  - booleans from the words `true` / `false` (any case);
  - `null` / `none` (any case) become JSON `null`;
  - everything else stays a string: leading zeros (`007`), `nan`, `inf`,
    underscores, empty strings.
- **Missing trailing values** — short rows are padded with `null`.
- **Blank lines** are ignored.

## Error handling (exit codes)

| Exit code | Meaning                                                   |
|-----------|-----------------------------------------------------------|
| 0         | Success.                                                  |
| 1         | Input file missing / unreadable / not valid UTF-8, malformed CSV data (a row with more fields than the header), or output write failure. |

All errors are reported on stderr as `error: <message>`.

## Examples

Input `people.csv`:

```csv
name,age,city,active
Иван,34,Київ,true
"O'Brien, Pat",29,"New York",false
```

Command:

```bash
python src/csv_to_json.py --input people.csv --output people.json --pretty
```

Output `people.json`:

```json
[
  {
    "name": "Иван",
    "age": 34,
    "city": "Київ",
    "active": true
  },
  {
    "name": "O'Brien, Pat",
    "age": 29,
    "city": "New York",
    "active": false
  }
]
```

## Tests

```bash
pytest tests/ -q
ruff check src/ tests/
```
