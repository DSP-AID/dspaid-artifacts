# json_to_csv

A small Python 3.10+ command-line script that converts a JSON file containing an
array of flat objects into a CSV file.

## Features

- Reads a JSON array of flat objects (`[{...}, {...}]`)
- Builds the CSV header from the union of all keys, in first-seen order
- Missing keys are filled with an empty string `""`
- `null` values become an empty string `""`
- Nested objects/arrays (if any) are serialized as compact JSON strings
- Proper CSV quoting for commas, double quotes and newlines inside values
- UTF-8 in / UTF-8 out, full Unicode support (Cyrillic, emoji, etc.)
- Empty input array produces an empty CSV file

## Requirements

- Python 3.10+ (standard library only, no third-party dependencies)

## Usage

```
python src/json_to_csv.py --input <path-to-json> --output <path-to-csv>
```

### CLI arguments

| Argument   | Required | Description                      |
|------------|----------|----------------------------------|
| `--input`  | yes      | Path to the input JSON file      |
| `--output` | yes      | Path to the output CSV file      |

### Examples

Basic conversion:

```bash
python src/json_to_csv.py --input data.json --output data.csv
```

Absolute paths (Windows):

```cmd
python src\json_to_csv.py --input C:\data\users.json --output C:\data\users.csv
```

Input `users.json`:

```json
[
  {"name": "Alice", "age": 30, "city": "Kyiv"},
  {"name": "Bob", "age": 25},
  {"name": "Oleg", "city": "Львів, UA"}
]
```

Output `users.csv`:

```csv
name,age,city
Alice,30,Kyiv
Bob,25,
Oleg,,"Львів, UA"
```

Note how `Bob`'s missing `city` and `Oleg`'s missing `age` become empty fields,
and the comma inside `"Львів, UA"` is safely quoted.

## Error handling

- Non-existent input file → clear error message, exit code 1
- Invalid JSON syntax → error with parser details, exit code 1
- Top-level JSON value that is not an array → error, exit code 1

## Tests

```bash
pytest tests/
```
