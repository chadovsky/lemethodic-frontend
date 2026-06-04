"""
t9 — Mojibake fix: CP1252-as-UTF-8 double-encoding artifacts.

Pattern generation: the original UTF-8 bytes for each character, when
misread as CP1252, produce a specific Unicode string. We generate that
mojibake string deterministically with b'...'.decode('cp1252') so this
script's own encoding is irrelevant.

Verified for each entry: bad.encode('cp1252').decode('utf-8') == good.
"""
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')


def moji(utf8_bytes: bytes, replacement: str):
    """Generate (mojibake_pattern, replacement) pair from original UTF-8 bytes."""
    bad = utf8_bytes.decode('cp1252')   # what CP1252 misread produces
    return (bad, replacement)


# 3-byte sequences first (longer patterns matched before their prefixes)
# Then 2-byte sequences
FIXES = [
    # --- 3-byte: typography ---
    moji(b'\xe2\x80\x94', '—'),   # em dash —
    moji(b'\xe2\x80\x93', '–'),   # en dash  –
    moji(b'\xe2\x80\x99', '’'),   # right single quote  '
    moji(b'\xe2\x80\x9c', '“'),   # left double quote   "
    moji(b'\xe2\x80\xa6', '…'),   # ellipsis            …
    moji(b'\xe2\x86\x92', '→'),   # right arrow         ->
    moji(b'\xe2\x89\xa5', '≥'),   # greater-or-equal    >=
    # --- 2-byte: accented vowels / special ---
    moji(b'\xc3\xa9', 'é'),        # e-acute     é
    moji(b'\xc3\xa8', 'è'),        # e-grave     è
    moji(b'\xc3\xa0', 'à'),        # a-grave     à
    moji(b'\xc3\xaa', 'ê'),        # e-circ      ê
    moji(b'\xc3\xae', 'î'),        # i-circ      î
    moji(b'\xc3\xb4', 'ô'),        # o-circ      ô
    moji(b'\xc3\xbb', 'û'),        # u-circ      û
    moji(b'\xc3\xa7', 'ç'),        # c-cedilla   ç
    moji(b'\xc3\x80', 'À'),        # A-grave     À
    moji(b'\xc3\xa2', 'â'),        # a-circ      â
    moji(b'\xc3\x97', '×'),        # mult sign   x
]

root = Path('.')
skip = {'node_modules', '.next', '.git', 'scripts', 'public'}
exts = ('*.tsx', '*.ts', '*.jsx', '*.js', '*.css', '*.md')

changed = []
total_fixes = 0

for ext in exts:
    for path in root.rglob(ext):
        if set(path.parts) & skip:
            continue
        try:
            original = path.read_text(encoding='utf-8')
        except Exception:
            continue

        result = original
        count = 0
        for bad, good in FIXES:
            n = result.count(bad)
            if n:
                result = result.replace(bad, good)
                count += n

        if result != original:
            nl = '\r\n' if '\r\n' in original else '\n'
            path.write_text(result, encoding='utf-8', newline=nl)
            changed.append((str(path), count))
            total_fixes += count

print(f'Fixed {len(changed)} files, {total_fixes} replacements total:')
for f, n in sorted(changed):
    print(f'  {n:3d}  {f}')

# Verification: look for any surviving CP1252 mojibake patterns
print('\n--- Verification ---')
check_patterns = [bad for bad, _ in FIXES]
remaining = []
for ext in exts:
    for path in root.rglob(ext):
        if set(path.parts) & skip:
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except Exception:
            continue
        for pat in check_patterns:
            if pat in text:
                remaining.append((str(path), repr(pat)))
                break

if remaining:
    print(f'STILL HAS MOJIBAKE ({len(remaining)} files):')
    for f, pat in remaining:
        print(f'  {pat}  in  {f}')
else:
    print('Clean - zero mojibake remaining.')
