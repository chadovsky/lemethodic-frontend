#!/usr/bin/env python3
"""Add layer tags to all ticket titles in BACKLOG.md."""
import re

TICKET_TAGS = {
    # F-0xx early series
    'F-038': '[BE]', 'F-039': '[FE]', 'F-040': '[FE]', 'F-041': '[FE]',
    'F-042': '[FE]', 'F-043': '[FE]', 'F-044': '[BE]', 'F-045': '[FE]',
    'F-046': '[FE]', 'F-047': '[FE+BE]', 'F-048': '[BE]', 'F-049': '[BE]',
    'F-050': '[BE]', 'F-051': '[BE]', 'F-052': '[BE]', 'F-053': '[BE]',
    'F-054': '[FE]', 'F-055': '[FE]', 'F-056': '[FE]', 'F-057': '[FE]',
    'F-058': '[FE]', 'F-059': '[FE+BE]',
    'F-061': '[FE+BE]', 'F-061.2a': '[FE+BE]', 'F-061.2': '[FE]',
    'F-061.3': '[FE]', 'F-062': '[FE+BE]', 'F-062.1': '[FE]',
    'F-062.2': '[FE]', 'F-062.3': '[FE+BE]', 'F-063': '[FE+BE]',
    'F-075a': '[BE]', 'F-075b': '[BE]', 'F-076': '[FE]',
    'F-083': '[BE]', 'F-084': '[FE+BE]', 'F-086': '[FE+BE]',
    'F-087': '[FE+BE]', 'F-088': '[FE+BE]', 'F-089': '[FE]',
    'F-091.0': '[FE]', 'F-108': '[FE]', 'F-110.1': '[FE]',
    # F-200 series
    'F-200': '[FE]', 'F-201': '[FE]', 'F-202': '[FE]', 'F-202.x': '[FE]',
    'F-202.split': '[FE]', 'F-203': '[FE]', 'F-203.paywall': '[FE]',
    'F-204': '[FE]', 'F-204.deep': '[FE]', 'F-205': '[FE]',
    'F-205.deep': '[FE]', 'F-206': '[FE]', 'F-206.speaking': '[FE]',
    'F-206.lessons': '[FE]', 'F-210': '[FE]', 'F-211': '[FE]',
    'F-212': '[FE]', 'F-213': '[FE]', 'F-213.celebration': '[FE]',
    'F-214': '[FE]', 'F-221': '[FE+BE]', 'F-222': '[FE]',
    'F-222.x': '[FE+BE]', 'F-223': '[FE]', 'F-224': '[FE+BE]',
    'F-225': '[FE]', 'F-225.constraint': '[FE]', 'F-226': '[Content]',
    'F-227': '[FE]', 'F-227.rhythm': '[FE]',
    # F-300 series
    'F-300a': '[FE]', 'F-300a.proof': '[Content]', 'F-300b': '[FE]',
    'F-300c': '[FE]', 'F-300d': '[Content]', 'F-300e': '[FE+BE]',
    'F-300f': '[FE+BE]', 'F-300g': '[Content]',
    # F-310 series
    'F-310': '[FE+BE]', 'F-310.fe': '[FE]', 'F-310.fe.coldreload': '[FE]',
    'F-311': '[BE]', 'F-312': '[BE]', 'F-312.0': '[BE]',
    # F-319 series
    'F-319': '[FE+BE]', 'F-320': '[BE]', 'F-321': '[Content]',
    'F-322': '[FE]', 'F-323': '[FE]', 'F-324': '[FE+BE]', 'F-325': '[FE]',
    # F-BUGS and F-VISUAL series
    'F-BUGS-001-FE-A': '[FE]', 'F-BUGS-001-FE-B': '[FE]',
    'F-BUGS-001-FE-C': '[FE]', 'F-BUGS-001-FE-D': '[FE]',
    'F-VISUAL-001': '[FE]',
    # F-326+ deviation/onboarding tickets
    'F-326': '[BE]', 'F-327': '[FE+BE]', 'F-328': '[FE]',
    'F-329': '[FE]', 'F-330': '[FE]', 'F-331': '[FE]', 'F-332': '[FE]',
    'F-333': '[FE]', 'F-334': '[FE]', 'F-335': '[FE]', 'F-336': '[FE+BE]',
    'F-337': '[FE+BE]', 'F-338': '[FE]', 'F-339': '[FE]',
    # P-series
    'P-100': '[FE]', 'P-100.5': '[FE]', 'P-104': '[FE]', 'P-104.x': '[FE]',
    'P-106.x': '[FE]', 'P-115': '[FE]', 'P-115.x': '[FE]',
    'P-200': '[BE]', 'P-201': '[BE]', 'P-202': '[BE]', 'P-203': '[BE]',
    'P-204': '[BE]', 'P-210': '[BE]', 'P-211': '[Content]', 'P-212': '[BE]',
    'P-213': '[Content]', 'P-220': '[FE]', 'P-220.z': '[FE]',
    'P-221': '[FE+BE]', 'P-222': '[FE+BE]', 'P-222.x': '[FE]',
    'P-222.y': '[FE]', 'P-228': '[Content]', 'P-229': '[Content]',
    'P-230': '[FE]', 'P-230.x': '[FE]', 'P-230.consolidate': '[FE]',
    'P-230.unify': '[FE]', 'P-231': '[FE]', 'P-232': '[FE]',
    'P-233': '[FE]', 'P-234': '[FE]', 'P-234.history': '[FE]',
    'P-234.exercises': '[FE+BE]', 'P-234.speaking-promptCluster': '[FE]',
    'P-235': '[FE]', 'P-236': '[FE]', 'P-237': '[FE]',
    'P-240': '[FE+BE]', 'P-241': '[FE+BE]', 'P-250': '[BE]',
    'P-251': '[FE+BE]', 'P-260': '[BE]', 'P-261': '[FE]',
    'P-262': '[FE+BE]', 'P-263': '[Content]', 'P-264': '[Content]',
    'P-265': '[Content]', 'P-266': '[BE]', 'P-267': '[FE]',
    'P-268': '[FE+BE]', 'P-269': '[FE]',
    # V-series
    'V-001': '[FE]', 'V-002': '[FE]', 'V-003': '[FE]',
    'V-003.opacity': '[FE]', 'V-004': '[FE]', 'V-005': '[FE]',
    'V-005.heading-axis': '[FE]', 'V-006': '[FE]', 'V-007': '[FE]',
    'V-008': '[FE]', 'V-009': '[FE]', 'V-009.be': '[BE]',
    'V-010': '[FE]', 'V-011': '[FE]', 'V-011.color': '[FE]',
    'V-012a': '[FE]', 'V-012b': '[FE]', 'V-012c': '[FE]',
    'V-012c.bento': '[FE]', 'V-013a': '[FE+BE]', 'V-013a.history': '[BE]',
    'V-013b': '[FE]', 'V-013b.lang-pref': '[BE]',
    'V-013b.notifications': '[FE+BE]', 'V-013b.password': '[FE+BE]',
    'V-013c': '[FE]', 'V-015c': '[FE]', 'V-015c.copy': '[Content]',
    'V-015d': '[FE]', 'V-015d.streak': '[FE+BE]', 'V-015d.trend': '[BE]',
    'V-016a.dashboard': '[FE+BE]', 'V-016a.fe': '[FE]',
    'V-016a.fix': '[FE]', 'V-016b': '[Content]', 'V-016c': '[FE]',
    'V-016c.fix': '[FE]', 'V-016d': '[FE]', 'V-016e': '[FE]',
    'V-016f': '[FE]', 'V-016g': '[FE]', 'V-016g.notify': '[BE]',
    # B-series
    'B-102': '[FE]', 'B-104': '[FE]',
    # M-series (tickets, not section headers)
    'M-101.z': '[Content]',
}

ALREADY_TAGGED = re.compile(r'^\[(?:FE\+BE|FE|BE|Content)\]')

TID = r'[A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*(?:\.[A-Za-z0-9]+)*'

# "### TICKET — Title" or "### TICKET: Title"
HEADING_RE = re.compile(r'^(###\s+)(' + TID + r')([ \t]*[—:][ \t]*)(.*)$')

# "TICKET STATUS_EMOJI Title"
STATUS_CHARS = '✅\U0001F504\U0001F4CB⏸'
LIST_RE = re.compile(r'^(' + TID + r')\s+([' + STATUS_CHARS + r'])\s+(.*)$')

def process_line(line):
    s = line.rstrip('\n')

    m = HEADING_RE.match(s)
    if m:
        prefix, tid, sep, title = m.group(1), m.group(2), m.group(3), m.group(4)
        if tid in TICKET_TAGS and not ALREADY_TAGGED.match(title):
            tag = TICKET_TAGS[tid]
            return f"{prefix}{tid}{sep}{tag} {title}\n"
        return line

    m = LIST_RE.match(s)
    if m:
        tid, status, title = m.group(1), m.group(2), m.group(3)
        if tid in TICKET_TAGS and not ALREADY_TAGGED.match(title):
            tag = TICKET_TAGS[tid]
            return f"{tid} {status} {tag} {title}\n"
        return line

    return line


with open('BACKLOG.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

modified = [process_line(line) for line in lines]
changed = sum(1 for a, b in zip(lines, modified) if a != b)

with open('BACKLOG.md', 'w', encoding='utf-8') as f:
    f.writelines(modified)

print(f"Modified {changed} lines")
