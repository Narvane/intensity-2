#!/usr/bin/env python3
"""Validate docs/refs.yaml paths and @ref:<id> citations in migrated files."""

from __future__ import annotations

import re
import sys
from pathlib import Path

REF_PATTERN = re.compile(r"@ref:([a-z0-9-]+)")
ROOT = Path(__file__).resolve().parent.parent
REFS_FILE = ROOT / "docs" / "refs.yaml"


def parse_refs_yaml(text: str) -> tuple[list[dict[str, str]], list[str]]:
    entries: list[dict[str, str]] = []
    scan_files: list[str] = []
    current: dict[str, str] | None = None
    in_scan_files = False

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        if line == "scan_files:":
            in_scan_files = True
            continue

        if in_scan_files:
            if line.startswith("- "):
                scan_files.append(line[2:].strip())
                continue
            in_scan_files = False

        if line.startswith("- id:"):
            if current:
                entries.append(current)
            current = {"id": line.split(":", 1)[1].strip()}
            continue

        if current is not None and line.startswith("path:"):
            current["path"] = line.split(":", 1)[1].strip()

    if current:
        entries.append(current)

    return entries, scan_files


def main() -> int:
    if not REFS_FILE.is_file():
        print(f"ERROR: missing {REFS_FILE.relative_to(ROOT)}", file=sys.stderr)
        return 1

    entries, scan_files = parse_refs_yaml(REFS_FILE.read_text(encoding="utf-8"))
    by_id = {entry["id"]: entry["path"] for entry in entries if "id" in entry and "path" in entry}

    if not by_id:
        print("ERROR: no entries parsed from refs.yaml", file=sys.stderr)
        return 1

    errors: list[str] = []

    for ref_id, path in sorted(by_id.items()):
        target = ROOT / path
        if not target.exists():
            errors.append(f"missing path for @ref:{ref_id} -> {path}")

    if not scan_files:
        errors.append("no validate.scan_files configured in refs.yaml")

    for rel_path in scan_files:
        file_path = ROOT / rel_path
        if not file_path.is_file():
            errors.append(f"scan file not found: {rel_path}")
            continue

        content = file_path.read_text(encoding="utf-8")
        for match in REF_PATTERN.finditer(content):
            ref_id = match.group(1)
            if ref_id not in by_id:
                errors.append(f"orphan @ref:{ref_id} in {rel_path}")

    if errors:
        print("Reference validation failed:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(
        f"OK: {len(by_id)} refs, {len(scan_files)} migrated files, "
        f"{sum(len(REF_PATTERN.findall((ROOT / p).read_text(encoding='utf-8'))) for p in scan_files if (ROOT / p).is_file())} @ref citations"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
