"""
main.py — CLI entry point.

Usage:
  python main.py                                   # built-in breast cancer dataset
  python main.py --csv /path/to/file.csv           # your CSV (last column = target)
  python main.py --csv /path/to/file.csv --target column_name
"""

import argparse
from core.pipeline import run_pipeline


def main():
    parser = argparse.ArgumentParser(description="Agentic AI Data Scientist — CLI")
    parser.add_argument("--csv",    type=str, default=None, help="Path to CSV file")
    parser.add_argument("--target", type=str, default=None, help="Target column name")
    args = parser.parse_args()

    run_pipeline(csv_path=args.csv, target_col=args.target)


if __name__ == "__main__":
    main()
