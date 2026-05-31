#!/usr/bin/env python3
"""Update test files from /la-methode to /cours/methode-tcf-canada for F-334."""
import re
import os

BASE_OLD = '/la-methode'
BASE_NEW = '/cours/methode-tcf-canada'

# Map of specific lesson URL replacements (old -> new)
# Note: lesson detail URLs get lecon- prefix
LESSON_NUM_RE = re.compile(r'/la-methode/(\d+)')
LESSON_LESSON_RE = re.compile(r'/la-methode/lesson/([^"\'\s/]+)')

def transform(text):
    # 1. Replace sidebar testid
    text = text.replace('sidebar-link-la-methode', 'sidebar-link-cours/methode-tcf-canada')

    # 2. Replace navigating description in test names
    text = text.replace('navigating dashboard→la-methode', 'navigating dashboard→cours/methode-tcf-canada')

    # 3. Replace regex URL assertions: /\/la-methode\/N$/ -> /\/cours\/methode-tcf-canada\/lecon-N$/
    #    These appear as literal regex in .toHaveURL() calls
    def replace_url_regex(m):
        n = m.group(1)
        return r'/\/cours\/methode-tcf-canada\/lecon-' + n + r'$/'
    text = re.sub(r'/\\\/la-methode\\\/(\d+)\$/', replace_url_regex, text)

    # 4. Replace string lesson URLs: '/la-methode/N' -> '/cours/methode-tcf-canada/lecon-N'
    def replace_lesson_str(m):
        n = m.group(1)
        return f'/cours/methode-tcf-canada/lecon-{n}'
    text = re.sub(r'/la-methode/(\d+)', replace_lesson_str, text)

    # 5. Replace /la-methode/lesson/N or /la-methode/lesson/N-M -> /cours/methode-tcf-canada/lecon-N
    def replace_lesson_lesson(m):
        slug = m.group(1)
        # Extract numeric part (e.g. "1-1" -> "1", "test-id" -> keep as is for audit tests)
        num_match = re.match(r'^(\d+)', slug)
        if num_match:
            return f'/cours/methode-tcf-canada/lecon-{num_match.group(1)}'
        return f'/cours/methode-tcf-canada/lesson/{slug}'
    text = re.sub(r'/la-methode/lesson/([^"\'\s,\)]+)', replace_lesson_lesson, text)

    # 6. Replace /la-methode/intro -> /cours/methode-tcf-canada/intro
    text = text.replace('/la-methode/intro', '/cours/methode-tcf-canada/intro')

    # 7. Replace bare /la-methode (not followed by /) -> /cours/methode-tcf-canada
    #    Must be after all the specific replacements above
    text = text.replace('/la-methode', '/cours/methode-tcf-canada')

    # 8. Fix test description strings that mention the old path
    text = text.replace("'unauthenticated visitor on /la-methode is redirected to /'",
                        "'unauthenticated visitor on /cours/methode-tcf-canada is redirected to /'")
    text = text.replace("'authenticated user on /la-methode sees the app shell'",
                        "'authenticated user on /cours/methode-tcf-canada sees the app shell'")

    # 9. Fix mockPush assertions: '/la-methode/N' should already be handled by rule 4 above
    # but let's also handle the CalledWith patterns

    return text

# Files to update
test_files = [
    'tests/e2e/app-shell.spec.ts',
    'tests/e2e/auth-flow.spec.ts',
    'tests/e2e/dashboard.spec.ts',
    'tests/e2e/ecole-detail.spec.ts',
    'tests/e2e/ecole-list.spec.ts',
    'tests/e2e/m0-audit.spec.ts',
    'tests/e2e/m2-font-audit.spec.ts',
    'tests/e2e/reduced-motion.spec.ts',
    'tests/e2e/t5-dark-mode-gallery.spec.ts',
    'tests/e2e/touch-targets.spec.ts',
    'tests/unit/dashboard/Dashboard.test.tsx',
    'tests/unit/diagnostic/RecommendationsStub.test.tsx',
    'tests/unit/ecole/LessonCard.test.tsx',
    'tests/unit/ecole/LessonDetail.test.tsx',
    'tests/unit/layout/AppShell.test.tsx',
    'tests/unit/layout/Sidebar.test.tsx',
]

changed = 0
for path in test_files:
    if not os.path.exists(path):
        print(f"SKIP (not found): {path}")
        continue
    with open(path, 'r', encoding='utf-8') as f:
        original = f.read()
    updated = transform(original)
    if updated != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(updated)
        changed += 1
        print(f"Updated: {path}")
    else:
        print(f"No change: {path}")

print(f"\nTotal files updated: {changed}")
