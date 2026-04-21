'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Settings } from 'lucide-react'
import RecordButton, { RecordingState } from './RecordButton'
import VuMeter from './VuMeter'
import CountdownTimer from './CountdownTimer'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const LAVENDER     = '#E0D4F0'
const BG           = '#FAFAF7'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

const PREP_SECS    = 120 // 2 minutes
const RECORD_SECS  = 180 // 3 minutes
const CORAL        = '#FF8B6B' // pastel recording accent (FIX 4)

const TOPIC = {
  prompt:
    'Certains pensent que les réseaux sociaux ont rapproché les gens. D\u2019autres estiment qu\u2019ils ont au contraire détérioré nos relations. Qu\u2019en pensez-vous\u00a0?',
  difficulty: 'B1-B2',
  theme: 'Society',
}

export default function Tache3Session() {
  const router = useRouter()

  type Phase = 'prep' | 'recording' | 'processing'
  const [phase, setPhase]               = useState<Phase>('prep')
  const [prepRemaining, setPrepRemaining] = useState(PREP_SECS)
  const [recElapsed, setRecElapsed]     = useState(0)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')

  function startRecording() {
    setPhase('recording')
    setRecordingState('recording')
  }

  function stopRecording() {
    setPhase('processing')
    setRecordingState('processing')
    setTimeout(() => {
      router.push('/speaking/feedback/placeholder')
    }, 1400)
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: BG,
        fontFamily: DISPLAY_FONT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ maxWidth: 440, margin: '0 auto', width: '100%', flex: 1 }}>

        {/* Top bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 64,
            backgroundColor: BG,
            borderBottom: '1px solid #1A1A1A0A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              if (confirm('End this session?')) router.push('/speaking')
            }}
            aria-label="Go back"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK, display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 16,
              color: INK,
              margin: 0,
              textAlign: 'center',
              flex: 1,
            }}
          >
            T&acirc;che 3 &middot; Argumentative monologue
          </p>
          <button
            aria-label="Settings"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK_MUTED, display: 'flex', alignItems: 'center' }}
          >
            <Settings size={20} strokeWidth={1.75} />
          </button>
        </header>

        {/* Body */}
        <main style={{ padding: '24px 20px', paddingBottom: 40 }}>

          {/* Topic card */}
          <div
            style={{
              backgroundColor: LAVENDER,
              borderRadius: 24,
              padding: '22px 22px',
              marginBottom: 32,
            }}
          >
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: INK_MUTED,
                margin: '0 0 10px',
              }}
            >
              Your topic
            </p>
            <h2
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 20,
                lineHeight: '28px',
                color: INK,
                margin: '0 0 12px',
              }}
            >
              {TOPIC.prompt}
            </h2>
            <p
              style={{
                fontWeight: 500,
                fontSize: 12,
                color: INK_MUTED,
                margin: 0,
              }}
            >
              Difficulty: {TOPIC.difficulty} &middot; Theme: {TOPIC.theme}
            </p>
          </div>

          {/* ── PREP STATE ── */}
          {phase === 'prep' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <h2
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 26,
                  color: INK,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                2 minutes to prepare
              </h2>
              <p
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '22px',
                  color: INK_SOFT,
                  margin: 0,
                  textAlign: 'center',
                  maxWidth: 280,
                }}
              >
                Think about your structure: introduction, 2–3 arguments, conclusion.
              </p>

              <CountdownTimer
                totalSeconds={PREP_SECS}
                remaining={prepRemaining}
                onTick={setPrepRemaining}
                onComplete={startRecording}
                size={140}
                accentColor={INK}
              />

              {/* Ready button */}
              <button
                onClick={startRecording}
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: INK,
                  color: '#FFFFFF',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  marginTop: 4,
                }}
              >
                Ready — Record now
              </button>

              <button
                disabled
                aria-disabled="true"
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 500,
                  fontSize: 13,
                  color: INK_MUTED,
                  cursor: 'not-allowed',
                  padding: 0,
                  opacity: 0.5,
                }}
              >
                Add 1 more minute
              </button>
            </div>
          )}

          {/* ── RECORDING STATE ── */}
          {(phase === 'recording' || phase === 'processing') && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <h2
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 26,
                  color: INK,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {phase === 'processing' ? 'Analyzing\u2026' : 'Recording'}
              </h2>
              {phase === 'recording' && (
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '22px',
                    color: INK_SOFT,
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  Speak for up to 3 minutes. Tap to stop early.
                </p>
              )}

              <CountdownTimer
                totalSeconds={RECORD_SECS}
                remaining={RECORD_SECS - recElapsed}
                onTick={() => setRecElapsed((e) => e + 1)}
                onComplete={stopRecording}
                size={140}
                countUp
                maxSeconds={RECORD_SECS}
                accentColor={phase === 'processing' ? INK_MUTED : CORAL}
              />

              <RecordButton
                mode="tap"
                recordingState={recordingState}
                idleColor={CORAL}
                onTap={stopRecording}
              />

              {phase === 'recording' && <VuMeter active color={CORAL} />}

              {/* FIX 2: only show during recording, not during analyzing */}
              {phase === 'recording' && (
                <button
                  onClick={stopRecording}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 500,
                    fontSize: 13,
                    color: INK_MUTED,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Stop recording
                </button>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
