import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

root = Path('.')
skip = {'node_modules', '.next', '.git', 'scripts', 'public'}
exts = ('*.tsx', '*.ts', '*.jsx', '*.js', '*.css', '*.md')

# Mojibake: UTF-8 bytes read as Latin-1
mojibake_map = {
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ã ': 'à',
    'Ãª': 'ê',
    'Ã®': 'î',
    'Ã´': 'ô',
    'Ã»': 'û',
    'Ã§': 'ç',
    'â€™': '’',  # right single quote '
    'â€œ': '“',  # left double quote "
    'â€\x9d': '”',  # right double quote " (byte 0x9d)
    'â€"': '—',  # em dash —
    'â€"': '–',  # en dash – (same bytes different context, handled by order)
    'â€¦': '…',  # ellipsis …
}

hits = {}
for ext in exts:
    for path in root.rglob(ext):
        if set(path.parts) & skip:
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except Exception as e:
            continue
        found = []
        for bad, good in mojibake_map.items():
            if bad in text:
                count = text.count(bad)
                found.append((bad, good, count))
        if found:
            hits[str(path)] = found

print(f'Files with mojibake: {len(hits)}')
for f in sorted(hits.keys()):
    print(f'  {f}')
    for bad, good, count in hits[f]:
        print(f'    {repr(bad)} -> {repr(good)}  ({count}x)')
