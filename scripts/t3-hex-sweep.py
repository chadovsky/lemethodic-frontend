#!/usr/bin/env python3
"""
t3-v2 hex hardcode sweep: replace canonical themed hex with var(--token).
Dispatch: F-353, M2. DESIGN.md v2.

Replaces:
  #14213D  -> var(--dominant)   (dominant ink-blue, themes in dark)
  #C8102E  -> var(--accent)     (vermillion, themes in dark)
  #FAFAFA  -> var(--paper-tint) (near-white surface, themes in dark)
  #F4F4F5  -> var(--paper-edge) (edge surface, themes in dark)
  #FFFFFF  -> var(--paper)      BUT ONLY as backgroundColor (surfaces)
              NOT as color: (white text on dark buttons = fixed white)

Leaves fixed:
  - color: '#FFFFFF' (pure white text on dark backgrounds)
  - fg/textColor = '#FFFFFF' (computed text color on dark bg)
  - All #1A1A1A* alpha variants (no exact canonical match, flag)
  - All state/feedback colors (#1A4A2E, #7A1C20, #EF4444, etc.)
  - All legacy pastels (#FFD8C2, #D4E4D0, etc.)
  - Opacity-paper variants (#FFFFFFCC, #FFFFFF99)
  - themeColor: '#FFFFFF' in metadata
  - rgba(20, 33, 61, ...) pre-token variants
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

# Hex -> token for local constant declarations
CONST_MAP = {
    "'#14213D'": "'var(--dominant)'",
    "'#C8102E'": "'var(--accent)'",
    "'#FAFAFA'": "'var(--paper-tint)'",
    "'#FFFFFF'": "'var(--paper)'",
}

# Standalone const names to look for and replace values
CONST_PATTERNS = [
    # INK (dominant blue used as bg color, not text ink)
    (r"(const INK\s*=\s*)'#14213D'", r"\1'var(--dominant)'"),
    (r"(const VERMILLON\s*=\s*)'#C8102E'", r"\1'var(--accent)'"),
    (r"(const PAPER_TINT\s*=\s*)'#FAFAFA'", r"\1'var(--paper-tint)'"),
    (r"(const PAGE_BG\s*=\s*)'#FFFFFF'", r"\1'var(--paper)'"),
    # QuizClient default card background (overridden by quiz state colors)
    (r"(let bg\s*=\s*)'#FFFFFF'", r"\1'var(--paper)'"),
]

# backgroundColor: '#FFFFFF' → var(--paper)  (card/surface backgrounds)
# The regex is careful NOT to match color: '#FFFFFF' (text, fixed)
BG_PATTERNS = [
    # Standalone: backgroundColor: '#FFFFFF'
    (r"backgroundColor:\s*'#FFFFFF'", "backgroundColor: 'var(--paper)'"),
    (r'backgroundColor:\s*"#FFFFFF"', 'backgroundColor: "var(--paper)"'),
    # Conditional ternary with '#FFFFFF' as bg value
    (r"(\?\s*)'#FFFFFF'(\s*:\s*'transparent')", r"\1'var(--paper)'\2"),
    (r"(\?\s*)'#FFFFFF'(\s*:\s*'#1A1A1A04')", r"\1'var(--paper)'\2"),
    # backgroundColor: '#FAFAFA'
    (r"backgroundColor:\s*'#FAFAFA'", "backgroundColor: 'var(--paper-tint)'"),
    (r'backgroundColor:\s*"#FAFAFA"', 'backgroundColor: "var(--paper-tint)"'),
    # backgroundColor: '#F4F4F5'
    (r"backgroundColor:\s*'#F4F4F5'", "backgroundColor: 'var(--paper-edge)'"),
    # color: '#14213D' (dominant blue text - headings, nav items)
    (r"color:\s*'#14213D'", "color: 'var(--dominant)'"),
    (r'color:\s*"#14213D"', 'color: "var(--dominant)"'),
]

# Files to exclude from processing (globals.css token definitions)
EXCLUDE_FILES = {
    "app/globals.css",
    "styles/globals.css",
}


def process_file(path: Path) -> list[tuple[int, str, str]]:
    """Returns list of (lineno, old_line, new_line) for changed lines."""
    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    if rel in EXCLUDE_FILES:
        return []

    original = path.read_text(encoding="utf-8")
    lines = original.splitlines(keepends=True)
    changes = []

    for i, line in enumerate(lines):
        new_line = line

        # Apply const declaration patterns
        for pattern, replacement in CONST_PATTERNS:
            new_line = re.sub(pattern, replacement, new_line)

        # Apply backgroundColor and color patterns
        for pattern, replacement in BG_PATTERNS:
            new_line = re.sub(pattern, replacement, new_line)

        if new_line != line:
            changes.append((i + 1, line.rstrip(), new_line.rstrip()))
            lines[i] = new_line

    if changes:
        path.write_text("".join(lines), encoding="utf-8")

    return changes


def find_flagged(path: Path) -> list[tuple[int, str]]:
    """Find remaining hex instances that are ambiguous (not replaced, not canonical fixed)."""
    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    if rel in EXCLUDE_FILES:
        return []

    # Ambiguous / no-exact-token patterns
    AMBIGUOUS_PATTERNS = [
        r"#1A1A1A[0-9A-Fa-f]{2}",        # #1A1A1A + alpha variants
        r"#FFFFFFCC",                      # paper at 80% opacity
        r"#FFFFFF99",                      # paper at 60% opacity
        r"rgba\(20,\s*33,\s*61",           # pre-token ink-alpha base (wrong RGB)
        r"#E23A54",                        # dark-mode accent hardcoded in light-mode file
        r"#FAFAF7|#FAF7F2",               # warm whites, no v2 analog
        r"#1C1A16",                        # near-black, no token
    ]
    flags = []
    try:
        text = path.read_text(encoding="utf-8")
        for i, line in enumerate(text.splitlines()):
            for pat in AMBIGUOUS_PATTERNS:
                if re.search(pat, line):
                    flags.append((i + 1, line.strip()))
                    break
    except Exception:
        pass
    return flags


def main():
    target_globs = ["app/**/*.tsx", "app/**/*.ts", "components/**/*.tsx", "components/**/*.ts",
                    "app/globals.css"]
    skip_dirs = {"node_modules", ".next", ".claude"}

    all_changes = []
    all_flags = []
    files_changed = set()

    for pattern in target_globs:
        for p in ROOT.glob(pattern):
            if any(skip in p.parts for skip in skip_dirs):
                continue
            changes = process_file(p)
            if changes:
                rel = str(p.relative_to(ROOT)).replace("\\", "/")
                files_changed.add(rel)
                for lineno, old, new in changes:
                    all_changes.append((rel, lineno, old.strip(), new.strip()))

    # Find ambiguous remaining
    for pattern in target_globs:
        for p in ROOT.glob(pattern):
            if any(skip in p.parts for skip in skip_dirs):
                continue
            flags = find_flagged(p)
            if flags:
                rel = str(p.relative_to(ROOT)).replace("\\", "/")
                for lineno, line in flags:
                    all_flags.append((rel, lineno, line))

    print(f"=== REPLACED ({len(all_changes)} instances across {len(files_changed)} files) ===")
    for rel, lineno, old, new in sorted(all_changes):
        print(f"  {rel}:{lineno}")
        print(f"    - {old[:100]}")
        print(f"    + {new[:100]}")

    print()
    print(f"=== AMBIGUOUS / NO-EXACT-TOKEN ({len(all_flags)} instances) ===")
    for rel, lineno, line in sorted(all_flags):
        print(f"  {rel}:{lineno}: {line[:120]}")


if __name__ == "__main__":
    main()
