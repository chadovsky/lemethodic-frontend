"""
t9 — French hardcoded string audit.
Finds French text literals in .tsx / .ts component files.
Reports candidate locations for i18n extraction — does NOT extract.
"""
import sys
import re
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

root = Path('.')
skip = {'node_modules', '.next', '.git', 'scripts', 'public', 'tests'}

# French indicators: common French words / patterns likely NOT to appear in English
FRENCH_WORDS = re.compile(
    r'\b(?:le|la|les|un|une|des|du|de|et|est|sont|avec|pour|dans|sur|par|'
    r'vous|nous|votre|notre|mon|mes|ses|leur|leurs|qui|que|qu[e\']|ce|cette|'
    r'pas|plus|mais|ou|si|car|donc|aussi|même|tout|toute|tous|toutes|'
    r'commencer|continuer|retour|suivant|voir|aller|revenir|choisir|'
    r'niveau|examen|méthode|résultat|score|exercice|pratique|module|'
    r'chapitre|leçon|cours|langue|français|anglais|espagnol|'
    r'tableau de bord|bibliothèque|vocabulaire|grammaire|'
    r'bonjour|merci|oui|non|voilà|déjà|encore|bien|mal|grand|petit|'
    r'nouveau|nouveau|ancienne?|prochaine?|dernière?|'
    r'inscription|connexion|compte|profil|paramètre|'
    r'en cours|terminé|complété|réussi|échoué)\b',
    re.IGNORECASE | re.UNICODE
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

        # Find string literals (single-quoted, double-quoted, template literals, JSX text)
        # Simple heuristic: look for lines with French words inside string-like contexts
        lines_with_french = []
        for i, line in enumerate(text.splitlines(), 1):
            # Skip comments
            stripped = line.lstrip()
            if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                continue
            # Skip pure test assertions (getByText, getByRole, etc.)
            if 'getByText' in line or 'getByRole' in line or 'toHaveText' in line:
                continue
            # Skip type definitions and imports
            if stripped.startswith('import ') or stripped.startswith('type ') or stripped.startswith('interface '):
                continue
            # Skip CSS / style properties
            if re.search(r'fontFamily|fontSize|color:|backgroundColor', line):
                continue
            # Look for French indicators in string content
            if FRENCH_WORDS.search(line):
                # Extract the relevant snippet
                excerpt = line.strip()[:120]
                lines_with_french.append((i, excerpt))

        if lines_with_french:
            results.append((str(path), lines_with_french))

print(f'Files with potential hardcoded French strings: {len(results)}\n')
for path, lines in sorted(results):
    print(f'  {path}')
    for lineno, excerpt in lines[:8]:  # cap at 8 lines per file
        print(f'    L{lineno}: {excerpt}')
    if len(lines) > 8:
        print(f'    ... ({len(lines) - 8} more lines)')
    print()
