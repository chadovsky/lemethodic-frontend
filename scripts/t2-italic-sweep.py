#!/usr/bin/env python3
"""
t2-v2 italic sweep: remove fontStyle: 'italic' from all non-exception TSX/TS files.
Dispatch: F-357, M2. DESIGN.md v2 s8: no italic in display type.

Exceptions (French-word typographic convention -- foreign language display):
  - components/vocabulaire/ChunkRow.tsx line 32
  - components/vocabulaire/Flashcard.tsx line 60
  - components/vocabulaire/Flashcard.tsx line 126
  - components/vocabulaire/QuizQuestion.tsx line 109
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

# Lines to protect (relative path, 1-indexed line number).
# These display French words in italic per typographic convention.
EXCEPTIONS: set[tuple[str, int]] = {
    ("components/vocabulaire/ChunkRow.tsx", 32),
    ("components/vocabulaire/Flashcard.tsx", 60),
    ("components/vocabulaire/Flashcard.tsx", 126),
    ("components/vocabulaire/QuizQuestion.tsx", 109),
}

# Files with Tailwind `italic` class to clean (remove the class token).
TAILWIND_ITALIC_FILES = [
    "components/ecole/intro/EcoleIntro.tsx",
    "components/landing/sections/MethodologySection.tsx",
    "components/landing/TestimonialCard.tsx",
    "components/onboarding/EcoleReveal.tsx",
    "components/writing/WritingSubmissionClient.tsx",
]


def is_excepted(rel_path: str, lineno: int) -> bool:
    return (rel_path, lineno) in EXCEPTIONS


def process_file(path: Path) -> tuple[int, int]:
    """Returns (lines_removed, tailwind_tokens_removed)."""
    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    original = path.read_text(encoding="utf-8")
    lines = original.splitlines(keepends=True)

    new_lines = []
    lines_removed = 0

    for i, line in enumerate(lines):
        lineno = i + 1

        if is_excepted(rel, lineno):
            new_lines.append(line)
            continue

        # Pattern 1: standalone  `          fontStyle: 'italic',`
        # (optional leading whitespace, nothing else on line)
        if re.match(r"^\s+fontStyle:\s*'italic',\s*$", line):
            lines_removed += 1
            continue

        # Pattern 2: conditional `fontStyle: muted ? 'italic' : 'normal',`
        if re.match(r"^\s+fontStyle:\s*\w+\s*\?\s*'italic'\s*:\s*'normal',\s*$", line):
            lines_removed += 1
            continue

        # Pattern 3: inline before another property  `fontStyle: 'italic', fontSize: ...`
        modified = re.sub(r"fontStyle:\s*'italic',\s*", "", line)

        # Pattern 4: inline after another property  `, fontStyle: 'italic'`
        modified = re.sub(r",\s*fontStyle:\s*'italic'", "", modified)

        if modified != line:
            lines_removed += 1

        new_lines.append(modified)

    result = "".join(new_lines)
    tailwind_removed = 0

    if rel in TAILWIND_ITALIC_FILES:
        new_result, n = re.subn(r"\bitalic\b\s*", "", result)
        if n:
            # Clean up double spaces left by removal inside className strings
            new_result = re.sub(r'className="([^"]*?)\s{2,}([^"]*?)"',
                                lambda m: 'className="' + re.sub(r'\s{2,}', ' ', m.group(0)[10:-1]) + '"',
                                new_result)
            result = new_result
            tailwind_removed = n

    if result != original:
        path.write_text(result, encoding="utf-8")

    return lines_removed, tailwind_removed


def main():
    target_globs = ["app/**/*.tsx", "app/**/*.ts", "components/**/*.tsx", "components/**/*.ts"]
    skip_dirs = {"node_modules", ".next", ".claude"}

    total_lines = 0
    total_tailwind = 0
    files_changed = []

    for pattern in target_globs:
        for p in ROOT.glob(pattern):
            if any(skip in p.parts for skip in skip_dirs):
                continue
            removed, tw = process_file(p)
            if removed or tw:
                rel = str(p.relative_to(ROOT)).replace("\\", "/")
                files_changed.append((rel, removed, tw))
                total_lines += removed
                total_tailwind += tw

    print(f"Files changed: {len(files_changed)}")
    print(f"fontStyle italic instances removed: {total_lines}")
    print(f"Tailwind italic tokens removed: {total_tailwind}")
    print()
    for f, lr, tw in sorted(files_changed):
        parts = []
        if lr:
            parts.append(f"{lr} fontStyle")
        if tw:
            parts.append(f"{tw} tailwind")
        print(f"  {f} ({', '.join(parts)})")


if __name__ == "__main__":
    main()
