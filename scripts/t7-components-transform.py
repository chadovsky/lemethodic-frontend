import sys
import re
import os
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

root = Path('.')

replacements = [
    # ed-* — fg-soft before fg; warm variants before base
    (r'var\(--ed-fg-soft\)', 'var(--lm-text-secondary)'),
    (r'var\(--ed-fg\)', 'var(--lm-text-primary)'),
    (r'var\(--ed-bg\)', 'var(--lm-bg-base)'),
    (r'var\(--ed-accent\)', 'var(--cta-primary)'),
    (r'var\(--ed-muted\)', 'var(--lm-text-tertiary)'),
    (r'var\(--ed-rule\)', 'var(--lm-border-subtle)'),
    (r'var\(--ed-paper\)', 'var(--lm-bg-surface)'),
    (r'var\(--ed-warm-peach-deep\)', 'var(--lm-warm-peach-deep)'),
    (r'var\(--ed-warm-peach\)', 'var(--lm-warm-peach)'),
    (r'var\(--ed-warm-sage-deep\)', 'var(--lm-warm-sage-deep)'),
    (r'var\(--ed-warm-sage\)', 'var(--lm-warm-sage)'),
    (r'var\(--ed-warm-espresso\)', 'var(--lm-warm-espresso)'),
    (r'var\(--ed-warm-cream\)', 'var(--lm-warm-cream)'),
    (r'var\(--ed-warm-sand\)', 'var(--lm-warm-sand)'),
    (r'var\(--ed-ease, cubic-bezier\(0\.16, 1, 0\.3, 1\)\)', 'var(--lm-ease)'),
    (r'var\(--ed-ease, ease\)', 'var(--lm-ease, ease)'),
    (r'var\(--ed-ease\)', 'var(--lm-ease)'),
    (r'var\(--ease-spring\)', 'var(--lm-ease-spring)'),
    (r'var\(--ed-duration-hover, 200ms\)', 'var(--lm-duration-hover)'),
    (r'var\(--ed-duration-hover\)', 'var(--lm-duration-hover)'),
    (r'var\(--ed-duration-state\)', 'var(--lm-duration-state)'),
    (r'var\(--ed-duration-reveal\)', 'var(--lm-duration-reveal)'),
    # fp-* — more specific first
    (r'var\(--fp-sage-deep-25\)', 'var(--lm-success-25)'),
    (r'var\(--fp-sage-deep\)', 'var(--lm-success)'),
    (r'var\(--fp-peach-deep\)', 'var(--lm-warm-peach-deep)'),
    (r'var\(--fp-ink-soft\)', 'var(--lm-text-secondary)'),
    (r'var\(--fp-ink-muted\)', 'var(--lm-text-tertiary)'),
    (r'var\(--fp-ink\)', 'var(--lm-text-primary)'),
    (r'var\(--fp-peach\)', 'var(--lm-pastel-peach)'),
    (r'var\(--fp-sage\)', 'var(--lm-pastel-sage)'),
    (r'var\(--fp-butter\)', 'var(--lm-pastel-butter)'),
    (r'var\(--fp-lavender\)', 'var(--lm-pastel-lavender)'),
    (r'var\(--fp-sky\)', 'var(--lm-pastel-sky)'),
    (r'var\(--fp-blush\)', 'var(--lm-pastel-blush)'),
    (r'var\(--fp-canvas\)', 'var(--lm-bg-base)'),
    (r'var\(--fp-track\)', 'var(--lm-border-subtle)'),
    (r'var\(--fp-error\)', 'var(--lm-error)'),
    (r'var\(--fp-safe-top\)', 'var(--lm-safe-top)'),
    (r'var\(--fp-safe-bottom\)', 'var(--lm-safe-bottom)'),
    (r'var\(--fp-safe-left\)', 'var(--lm-safe-left)'),
    (r'var\(--fp-safe-right\)', 'var(--lm-safe-right)'),
]

skip_dirs = {'node_modules', '.next', '.git', 'scripts', 'docs'}
changed_files = []
total_replacements = 0

for ext in ('*.tsx', '*.ts'):
    for path in root.rglob(ext):
        # Skip excluded dirs
        parts = set(path.parts)
        if parts & skip_dirs:
            continue
        # Skip globals.css (already done) and this script
        if path.name == 'globals.css' or 'transform' in path.name:
            continue

        try:
            original = path.read_text(encoding='utf-8')
        except Exception as e:
            print(f'  SKIP {path}: {e}')
            continue

        result = original
        count = 0
        for pattern, replacement in replacements:
            new_result = re.sub(pattern, replacement, result)
            if new_result != result:
                count += len(re.findall(pattern, result))
                result = new_result

        if result != original:
            path.write_text(result, encoding='utf-8', newline='\n' if '\r\n' not in original else None)
            changed_files.append(str(path))
            total_replacements += count

print(f'Changed {len(changed_files)} files, ~{total_replacements} replacements')
for f in sorted(changed_files):
    print(f'  {f}')

# Final verification: any remaining fp/ed refs in tsx/ts?
remaining = []
for ext in ('*.tsx', '*.ts'):
    for path in root.rglob(ext):
        parts = set(path.parts)
        if parts & skip_dirs:
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except:
            continue
        if re.search(r'var\(--fp-|var\(--ed-', text):
            remaining.append(str(path))

if remaining:
    print(f'\nSTILL HAS fp/ed refs ({len(remaining)} files):')
    for f in remaining:
        print(f'  {f}')
else:
    print('\nAll tsx/ts files clean.')
