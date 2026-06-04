"""
t9 — French hardcoded string audit (source files only, no worktrees).
Flags lines in .tsx/.ts components that contain French accented characters
inside string literals or JSX text. Reports for i18n triage — does not extract.
"""
import sys
import re
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

root = Path('.')
skip = {'node_modules', '.next', '.git', 'scripts', 'public', 'tests', '.claude'}

# Find French accented chars in string/JSX contexts
FRENCH_ACCENTED = re.compile(
    r'[éèàêîôûçœÉÈÀÊÎÔÛÇŒ]',
    re.UNICODE,
)

results = []
for ext in ('*.tsx', '*.ts'):
    for path in root.rglob(ext):
        if set(path.parts) & skip:
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except Exception:
            continue

        lines_with_french = []
        for i, line in enumerate(text.splitlines(), 1):
            stripped = line.lstrip()
            # Skip pure comments
            if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                continue
            # Skip import / type lines
            if stripped.startswith('import ') or stripped.startswith('export type ') or stripped.startswith('interface '):
                continue
            if FRENCH_ACCENTED.search(line):
                lines_with_french.append((i, line.strip()[:110]))

        if lines_with_french:
            results.append((str(path), lines_with_french))

print(f'Source files with hardcoded French strings: {len(results)}\n')
for path, lines in sorted(results):
    print(f'{path}')
    for lineno, excerpt in lines[:6]:
        print(f'  L{lineno}: {excerpt}')
    if len(lines) > 6:
        print(f'  ... +{len(lines)-6} more lines')
    print()
