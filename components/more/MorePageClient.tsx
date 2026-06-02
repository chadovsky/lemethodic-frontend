'use client'

// V-013b — /more page. Four sections (Profile / Settings / Account /
// About) over V-012b warm-editorial chrome. Each section is a paper card
// with 1px ed-rule on ed-bg page bg.

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, LogOut } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import { useOnboardingStore } from '@/lib/onboarding'
import { useSubmitResponseStore } from '@/lib/submitResponse'
import { useInterfaceLanguage, type InterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'

const ED_BG = 'var(--lm-bg-base)'
const ED_FG = 'var(--lm-text-primary)'
const ED_FG_SOFT = 'var(--lm-text-secondary)'
const ED_MUTED = 'var(--lm-text-tertiary)'
const ED_RULE = 'var(--lm-border-subtle)'
const ED_PAPER = 'var(--lm-bg-surface)'
const SANS = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const SERIF = 'var(--font-source-serif), Georgia, serif'

// V-013b — pinned. Bumped per release; reflects the soft-beta phase.
const APP_VERSION = '0.1.0-soft-beta'
const SUPPORT_EMAIL = 'support@lemethodic.com'

const EXAM_LABELS: Record<string, { en: string; fr: string }> = {
  tcf_canada: { en: 'TCF Canada', fr: 'TCF Canada' },
  tef_canada: { en: 'TEF Canada', fr: 'TEF Canada' },
  delf_b1_b2: { en: 'DELF B1 / B2', fr: 'DELF B1 / B2' },
  another_exam: { en: 'Another exam', fr: 'Un autre examen' },
  not_sure: { en: 'Not sure yet', fr: 'Pas encore décidé' },
}

const COPY = {
  en: {
    sections: {
      profile: 'Profile',
      settings: 'Settings',
      account: 'Account',
      about: 'About',
    },
    profile: {
      examLabel: 'Exam target',
      daysLabel: 'Days until exam',
      noExam: 'No exam scheduled',
    },
    settings: {
      language: 'Language',
      langEn: 'English',
      langFr: 'Français',
      notifications: 'Notifications',
      notificationsHint: 'Coming soon',
    },
    account: {
      logout: 'Sign out',
      changePassword: 'Change password',
      changePasswordHint: 'Coming soon',
    },
    about: {
      version: 'Version',
      support: 'Support',
      terms: 'Terms of service',
      privacy: 'Privacy policy',
      refund: 'Refund policy',
    },
  },
  fr: {
    sections: {
      profile: 'Profil',
      settings: 'Paramètres',
      account: 'Compte',
      about: 'À propos',
    },
    profile: {
      examLabel: 'Examen visé',
      daysLabel: "Jours avant l'examen",
      noExam: 'Aucun examen prévu',
    },
    settings: {
      language: 'Langue',
      langEn: 'English',
      langFr: 'Français',
      notifications: 'Notifications',
      notificationsHint: 'Bientôt',
    },
    account: {
      logout: 'Se déconnecter',
      changePassword: 'Changer le mot de passe',
      changePasswordHint: 'Bientôt',
    },
    about: {
      version: 'Version',
      support: 'Support',
      terms: "Conditions d'utilisation",
      privacy: 'Politique de confidentialité',
      refund: 'Politique de remboursement',
    },
  },
} as const

function daysUntilExam(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null
  const exam = new Date(isoDate)
  if (Number.isNaN(exam.getTime())) return null
  exam.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default function MorePageClient() {
  const router = useRouter()
  const language = useInterfaceLanguage()
  const copy = COPY[language]
  const user = useAuthStore((s) => s.user)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const token = useAuthStore((s) => s.token)

  const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? ''
  const avatarInitial = (firstName || user?.email?.[0] || 'L').charAt(0).toUpperCase()
  const examLabelEntry = user?.examProfile ? EXAM_LABELS[user.examProfile] : null
  const examLabel = examLabelEntry ? examLabelEntry[language] : copy.profile.noExam
  const examDays = daysUntilExam(user?.examDate)

  function handleLanguageToggle(next: InterfaceLanguage) {
    if (!user || !token || next === language) return
    // V-013b — local-only language flip until V-013b.lang-pref BE
    // endpoint is wired. The next /me fetch will reset to BE-stored
    // value; this gives the user immediate UI feedback in the meantime.
    setAuth(token, { ...user, interfaceLanguage: next })
  }

  async function handleLogout() {
    try {
      await api.auth.logout()
    } catch {
      // BE logout failure shouldn't block client-side cleanup; user
      // explicitly asked to sign out.
    }
    clearAuth()
    useOnboardingStore.getState().reset()
    useSubmitResponseStore.getState().clear()
    router.push('/')
  }

  return (
    <div className="ed-page-enter" style={{ minHeight: '100dvh', backgroundColor: ED_BG, fontFamily: SANS }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) clamp(20px, 4vw, 40px) 96px' }}>
        {/* Profile section — top of page, no header label, just the visual.
            V-014c — id="profile" anchors the TopNav dropdown link. */}
        <section id="profile" aria-label={copy.sections.profile} style={{ marginBottom: 32, scrollMarginTop: 80 }}>
          <div
            style={{
              backgroundColor: ED_PAPER,
              border: `1px solid ${ED_RULE}`,
              borderRadius: 4,
              padding: 'clamp(20px, 3vw, 32px)',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--lm-warm-peach)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 24, color: 'var(--lm-warm-espresso)' }}>
                {avatarInitial}
              </span>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 18,
                  color: ED_FG,
                  margin: 0,
                  marginBottom: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {firstName || user?.email}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 13, color: ED_MUTED, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Exam target row */}
          <div
            style={{
              backgroundColor: ED_PAPER,
              border: `1px solid ${ED_RULE}`,
              borderTop: 'none',
              padding: '14px 20px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 12,
              alignItems: 'baseline',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: ED_MUTED }}>
              {copy.profile.examLabel}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: ED_FG }}>{examLabel}</span>
          </div>
          {examDays !== null && (
            <div
              style={{
                backgroundColor: ED_PAPER,
                border: `1px solid ${ED_RULE}`,
                borderTop: 'none',
                borderRadius: '0 0 4px 4px',
                padding: '14px 20px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: ED_MUTED }}>
                {copy.profile.daysLabel}
              </span>
              <span style={{ fontFamily: SERIF, fontSize: 18, color: 'var(--lm-warm-espresso)' }}>
                {examDays}
              </span>
            </div>
          )}
        </section>

        {/* Settings */}
        <Section id="settings" title={copy.sections.settings}>
          <Row label={copy.settings.language}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['en', 'fr'] as const).map((l) => {
                const active = l === language
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleLanguageToggle(l)}
                    className="ed-btn-press"
                    aria-pressed={active}
                    style={{
                      fontFamily: SANS,
                      fontWeight: 500,
                      fontSize: 13,
                      padding: '6px 14px',
                      borderRadius: 999,
                      border: `1px solid ${active ? 'var(--lm-warm-peach-deep)' : ED_RULE}`,
                      backgroundColor: active ? 'var(--lm-warm-peach)' : 'transparent',
                      color: active ? ED_FG : ED_FG_SOFT,
                      cursor: 'pointer',
                      transition: 'background-color var(--lm-duration-hover) var(--lm-ease-spring), border-color var(--lm-duration-hover) var(--lm-ease-spring), color var(--lm-duration-hover) var(--lm-ease-spring)',
                    }}
                  >
                    {l === 'en' ? copy.settings.langEn : copy.settings.langFr}
                  </button>
                )
              })}
            </div>
          </Row>
          <Row label={copy.settings.notifications} hint={copy.settings.notificationsHint} disabled />
        </Section>

        {/* Account */}
        <Section id="account" title={copy.sections.account}>
          <Row label={copy.account.changePassword} hint={copy.account.changePasswordHint} disabled />
          <button
            type="button"
            onClick={handleLogout}
            className="ed-btn-press"
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '14px 20px',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: 12,
              alignItems: 'center',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--lm-error)',
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 14,
              transition: 'background-color var(--lm-duration-hover) var(--lm-ease-spring)',
            }}
          >
            <LogOut size={16} strokeWidth={2} />
            <span>{copy.account.logout}</span>
            <ChevronRight size={16} strokeWidth={2} color={ED_MUTED} />
          </button>
        </Section>

        {/* About */}
        <Section id="about" title={copy.sections.about}>
          <Row label={copy.about.version} value={APP_VERSION} />
          <RowLink label={copy.about.support} href={`mailto:${SUPPORT_EMAIL}`} value={SUPPORT_EMAIL} external />
          <RowLink label={copy.about.terms} href="/mentions-legales" />
          <RowLink label={copy.about.privacy} href="/confidentialite" />
          <RowLink label={copy.about.refund} href="/refund" />
        </Section>
      </div>
    </div>
  )
}

// ── Section + Row primitives ──────────────────────────────────────────────

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    // V-014c — scroll-margin-top accommodates the 64px sticky TopNav so
    // anchor jumps from /more#settings etc. land below the nav, not under it.
    <section id={id} aria-label={title} style={{ marginBottom: 32, scrollMarginTop: 80 }}>
      <h2
        style={{
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: ED_MUTED,
          margin: 0,
          marginBottom: 12,
          paddingLeft: 4,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          backgroundColor: ED_PAPER,
          border: `1px solid ${ED_RULE}`,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </section>
  )
}

interface RowProps {
  label: string
  value?: string
  hint?: string
  disabled?: boolean
  children?: React.ReactNode
}

function Row({ label, value, hint, disabled, children }: RowProps) {
  return (
    <div
      style={{
        padding: '14px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 12,
        alignItems: 'center',
        borderBottom: `1px solid ${ED_RULE}`,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <div>
        <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 14, color: ED_FG, margin: 0 }}>{label}</p>
        {hint && <p style={{ fontFamily: SANS, fontSize: 12, color: ED_MUTED, margin: 0, marginTop: 2 }}>{hint}</p>}
      </div>
      {children ?? (value && <span style={{ fontFamily: SANS, fontSize: 13, color: ED_FG_SOFT }}>{value}</span>)}
    </div>
  )
}

function RowLink({ label, href, value, external = false }: { label: string; href: string; value?: string; external?: boolean }) {
  const content = (
    <>
      <div>
        <p style={{ fontFamily: SANS, fontWeight: 500, fontSize: 14, color: ED_FG, margin: 0 }}>{label}</p>
        {value && <p style={{ fontFamily: SANS, fontSize: 12, color: ED_MUTED, margin: 0, marginTop: 2 }}>{value}</p>}
      </div>
      <ChevronRight size={16} strokeWidth={2} color={ED_MUTED} />
    </>
  )
  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 12,
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: `1px solid ${ED_RULE}`,
    color: ED_FG,
    textDecoration: 'none',
    transition: 'background-color var(--lm-duration-hover) var(--lm-ease-spring)',
  }
  if (external) {
    return (
      <a href={href} style={style}>
        {content}
      </a>
    )
  }
  return (
    <Link href={href} style={style}>
      {content}
    </Link>
  )
}
