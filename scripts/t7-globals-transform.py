import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('app/globals.css', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
print(f'Total lines: {len(lines)}')

# Step 1: Replace legacy fp/ed block (lines 78-172, idx 77-171) with lm tokens
lm_block = [
    '  /* ── DESIGN.md v1 — Le Méthodic canonical tokens (M2 t7, 2026-05-25) ──── */',
    '',
    '  /* Brand (warm ochre) */',
    '  --lm-brand: #C49A3A;',
    '  --lm-brand-deep: #8B6914;',
    '  --lm-brand-tint: #F5E8C0;',
    '  --lm-brand-glow: #E8C77A;',
    '',
    '  /* Per-couche colors (light mode) */',
    '  --lm-couche-propos: #BC4F2A;',
    '  --lm-couche-plan: #A66A2E;',
    '  --lm-couche-construction: #8E5A1F;',
    '  --lm-couche-pieges: #E0701D;',
    '  --lm-couche-musique: #D4A431;',
    '',
    '  /* Functional */',
    '  --lm-success: #6B8E3B;',
    '  --lm-success-25: rgba(107, 142, 59, 0.25);',
    '  --lm-warning: #C8841B;',
    '  --lm-error: #A8341B;',
    '  --lm-info: #7B6A8B;',
    '',
    '  /* Background / text / border (light mode defaults) */',
    '  --lm-bg-base: #FAF7F0;',
    '  --lm-bg-surface: #FFFFFF;',
    '  --lm-bg-subtle: #F0EBE0;',
    '  --lm-text-primary: #1E1A14;',
    '  --lm-text-secondary: #5C544A;',
    '  --lm-text-tertiary: #8B8275;',
    '  --lm-border-subtle: #E5DFD2;',
    '',
    '  /* Warm editorial palette */',
    '  --lm-warm-peach: #FFD8C2;',
    '  --lm-warm-peach-deep: #E0A890;',
    '  --lm-warm-sage: #B8C4A8;',
    '  --lm-warm-sage-deep: var(--accent-primary);',
    '  --lm-warm-espresso: #4A3528;',
    '  --lm-warm-cream: #FDFBF7;',
    '  --lm-warm-sand: #F5E6D8;',
    '',
    '  /* Onboarding pastel chip palette */',
    '  --lm-pastel-peach: #FFD8C2;',
    '  --lm-pastel-sage: #D4E4D0;',
    '  --lm-pastel-butter: #FFF0C2;',
    '  --lm-pastel-lavender: #E0D4F0;',
    '  --lm-pastel-sky: #CFE4F5;',
    '  --lm-pastel-blush: #F5D6D6;',
    '',
    '  /* Motion */',
    '  --lm-ease: cubic-bezier(0.16, 1, 0.3, 1);',
    '  --lm-ease-spring: cubic-bezier(0.32, 0.72, 0, 1);',
    '  --lm-ease-default: cubic-bezier(0, 0, 0.2, 1);',
    '  --lm-ease-enter: cubic-bezier(0.16, 1, 0.3, 1);',
    '  --lm-ease-exit: cubic-bezier(0.33, 1, 0.68, 1);',
    '  --lm-duration-fast: 200ms;',
    '  --lm-duration-base: 300ms;',
    '  --lm-duration-slow: 400ms;',
    '  --lm-duration-hover: 200ms;',
    '  --lm-duration-state: 600ms;',
    '  --lm-duration-reveal: 700ms;',
    '',
    '  /* Safe area passthroughs */',
    '  --lm-safe-top: env(safe-area-inset-top);',
    '  --lm-safe-bottom: env(safe-area-inset-bottom);',
    '  --lm-safe-left: env(safe-area-inset-left);',
    '  --lm-safe-right: env(safe-area-inset-right);',
]

new_lines = lines[:77] + lm_block + lines[172:]
print(f'After step 1: {len(new_lines)} lines')

content2 = '\n'.join(new_lines)
lines2 = content2.split('\n')

# Step 2: Find .dark { block and add lm dark overrides
dark_start = None
dark_end = None
for i, line in enumerate(lines2):
    if line.strip() == '.dark {':
        dark_start = i
    if dark_start is not None and i > dark_start and line.strip() == '}':
        dark_end = i
        break

print(f'dark block: lines {dark_start+1}-{dark_end+1} (1-based)')

lm_dark = [
    '',
    '  /* DESIGN.md v1 dark mode overrides */',
    '  --lm-brand: #D4A847;',
    '  --lm-brand-deep: #A88830;',
    '  --lm-brand-tint: #3A2F18;',
    '  --lm-brand-glow: #C9A04A;',
    '  --lm-couche-propos: #D66A47;',
    '  --lm-couche-plan: #BC8447;',
    '  --lm-couche-construction: #B07A38;',
    '  --lm-couche-pieges: #F08940;',
    '  --lm-couche-musique: #E0BC50;',
    '  --lm-success: #8FB058;',
    '  --lm-success-25: rgba(143, 176, 88, 0.25);',
    '  --lm-warning: #E2A040;',
    '  --lm-error: #D45A3A;',
    '  --lm-info: #9B8AAB;',
    '  --lm-bg-base: #1A1612;',
    '  --lm-bg-surface: #241F1A;',
    '  --lm-bg-subtle: #2C2620;',
    '  --lm-text-primary: #F5F0E5;',
    '  --lm-text-secondary: #B5AC9C;',
    '  --lm-text-tertiary: #857D70;',
    '  --lm-border-subtle: #3A332B;',
]

lines3 = lines2[:dark_end] + lm_dark + lines2[dark_end:]
content3 = '\n'.join(lines3)
lines3 = content3.split('\n')
print(f'After step 2: {len(lines3)} lines')

# Step 3: Replace @theme inline fp/ed entries with lm entries
theme_fp_start = None
theme_ed_end = None
for i, line in enumerate(lines3):
    if '/* LeMethodic legacy design tokens (kept as Tailwind utilities through' in line:
        theme_fp_start = i
    if theme_fp_start is not None and '--animate-duration-ed-reveal:' in line:
        theme_ed_end = i
        break

print(f'@theme fp/ed block: lines {theme_fp_start+1}-{theme_ed_end+1} (1-based)')

lm_theme = [
    '  /* DESIGN.md v1 — Le Méthodic canonical Tailwind utilities */',
    '  --color-lm-brand: var(--lm-brand);',
    '  --color-lm-brand-deep: var(--lm-brand-deep);',
    '  --color-lm-brand-tint: var(--lm-brand-tint);',
    '  --color-lm-brand-glow: var(--lm-brand-glow);',
    '  --color-lm-couche-propos: var(--lm-couche-propos);',
    '  --color-lm-couche-plan: var(--lm-couche-plan);',
    '  --color-lm-couche-construction: var(--lm-couche-construction);',
    '  --color-lm-couche-pieges: var(--lm-couche-pieges);',
    '  --color-lm-couche-musique: var(--lm-couche-musique);',
    '  --color-lm-success: var(--lm-success);',
    '  --color-lm-warning: var(--lm-warning);',
    '  --color-lm-error: var(--lm-error);',
    '  --color-lm-info: var(--lm-info);',
    '  --color-lm-bg-base: var(--lm-bg-base);',
    '  --color-lm-bg-surface: var(--lm-bg-surface);',
    '  --color-lm-bg-subtle: var(--lm-bg-subtle);',
    '  --color-lm-text-primary: var(--lm-text-primary);',
    '  --color-lm-text-secondary: var(--lm-text-secondary);',
    '  --color-lm-text-tertiary: var(--lm-text-tertiary);',
    '  --color-lm-border-subtle: var(--lm-border-subtle);',
    '  --color-lm-warm-peach: var(--lm-warm-peach);',
    '  --color-lm-warm-peach-deep: var(--lm-warm-peach-deep);',
    '  --color-lm-warm-espresso: var(--lm-warm-espresso);',
    '  --color-lm-warm-cream: var(--lm-warm-cream);',
    '  --color-lm-warm-sand: var(--lm-warm-sand);',
    '  --color-lm-pastel-peach: var(--lm-pastel-peach);',
    '  --color-lm-pastel-sage: var(--lm-pastel-sage);',
    '  --color-lm-pastel-butter: var(--lm-pastel-butter);',
    '  --color-lm-pastel-lavender: var(--lm-pastel-lavender);',
    '  --color-lm-pastel-sky: var(--lm-pastel-sky);',
    '  --color-lm-pastel-blush: var(--lm-pastel-blush);',
]

lines4 = lines3[:theme_fp_start] + lm_theme + lines3[theme_ed_end+1:]
content4 = '\n'.join(lines4)

# Step 4: Replace all var(--fp-*) and var(--ed-*) usages in remaining CSS
replacements = [
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

result = content4
for pattern, replacement in replacements:
    result = re.sub(pattern, replacement, result)

with open('app/globals.css', 'w', encoding='utf-8', newline='\n') as f:
    f.write(result)

remaining_fp = len(re.findall(r'var\(--fp-', result))
remaining_ed = len(re.findall(r'var\(--ed-', result))
print(f'globals.css written. Remaining var(--fp-*): {remaining_fp}, var(--ed-*): {remaining_ed}')
if remaining_fp > 0 or remaining_ed > 0:
    for pat in [r'var\(--fp-\S+\)', r'var\(--ed-\S+\)']:
        found = re.findall(pat, result)
        if found:
            print('  Still present:', set(found))
