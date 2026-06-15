'use client'

import { useState } from 'react'
import type { UserProgress } from '@/lib/types'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

interface Props {
  progress: UserProgress | null
  progressError: boolean
  onPatchTarget: (minutes: number) => Promise<void>
}

export default function DailyTargetWidget({ progress, progressError, onPatchTarget }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const status = progressError ? 'error' : progress === null ? 'loading' : 'ok'
  const target = progress?.dailyTargetMinutes ?? 30

  function startEdit() {
    setDraft(String(target))
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  async function saveEdit() {
    const val = parseInt(draft, 10)
    if (isNaN(val) || val < 5 || val > 120) return
    setSaving(true)
    try {
      await onPatchTarget(val)
      setEditing(false)
    } catch {
      // onPatchTarget reverts on failure; keep edit mode open so the user can retry.
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      data-testid="dashboard-widget-daily-target"
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2
          style={{
            fontFamily: SERIF_FONT,
            fontWeight: 500,
            fontSize: 'clamp(16px, 1.8vw, 20px)',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Objectif du jour
        </h2>
        {status === 'ok' && !editing && (
          <button
            data-testid="daily-target-edit-btn"
            onClick={startEdit}
            aria-label="Modifier l'objectif"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: SANS_FONT,
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              padding: '2px 4px',
            }}
          >
            Modifier
          </button>
        )}
      </div>

      {status === 'loading' ? (
        <div className="ed-skeleton" style={{ height: 48, borderRadius: 4 }} />
      ) : status === 'error' ? (
        <p
          data-testid="daily-target-error"
          style={{
            fontFamily: SANS_FONT,
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Données indisponibles
        </p>
      ) : editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            data-testid="daily-target-input"
            type="number"
            min={5}
            max={120}
            step={5}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{
              fontFamily: SERIF_FONT,
              fontSize: 'clamp(28px, 3vw, 40px)',
              fontWeight: 500,
              width: 100,
              border: '1px solid var(--rule-default)',
              borderRadius: 4,
              padding: '4px 8px',
              color: 'var(--text-primary)',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              data-testid="daily-target-save-btn"
              onClick={saveEdit}
              disabled={saving}
              style={{
                fontFamily: SANS_FONT,
                fontSize: '0.8125rem',
                padding: '4px 12px',
                borderRadius: 4,
                border: '1px solid var(--rule-default)',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                background: 'none',
              }}
            >
              {saving ? '…' : 'Enregistrer'}
            </button>
            <button
              data-testid="daily-target-cancel-btn"
              onClick={cancelEdit}
              style={{
                fontFamily: SANS_FONT,
                fontSize: '0.8125rem',
                padding: '4px 12px',
                borderRadius: 4,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <>
          <span
            data-testid="daily-target-value"
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 500,
              fontSize: 'clamp(36px, 4vw, 52px)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            {target}
          </span>
          <span
            style={{
              fontFamily: SANS_FONT,
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            {target === 1 ? 'minute par jour' : 'minutes par jour'}
          </span>
        </>
      )}
    </section>
  )
}
