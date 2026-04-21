'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react'
import ChatBubble from './ChatBubble'
import RecordButton, { RecordingState } from './RecordButton'
import VuMeter from './VuMeter'
import TranscriptReviewPanel from './TranscriptReviewPanel'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const SAGE         = '#D4E4D0'
const BG           = '#FAFAF7'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

type Turn = { side: 'examiner' | 'user'; text: string }

const INITIAL_TURNS: Turn[] = [
  { side: 'examiner', text: 'Bonjour, comment puis-je vous aider\u00a0?' },
  { side: 'user',     text: 'Bonjour. Je voudrais partir en vacances dans un pays francophone.' },
  { side: 'examiner', text: 'Très bien. Avez-vous une période en tête\u00a0?' },
]

const INFO_TARGETS = [
  'Destination options',
  'Price range',
  'Duration of stay',
  'Type of accommodation',
  'Included activities',
  'Weather forecast',
  'Visa requirements',
]

interface Tache2SessionProps {
  scenario?: string
}

export default function Tache2Session({ scenario = 'agence-voyages' }: Tache2SessionProps) {
  const router = useRouter()
  const [muted, setMuted]                   = useState(false)
  const [briefExpanded, setBriefExpanded]   = useState(true)
  const [briefDismissed, setBriefDismissed] = useState(false)
  const [recordingState, setRecordingState] = useState<RecordingState>('recording')
  const [pttTimer, setPttTimer]             = useState(8) // design review: show 0:08
  const [showTranscript, setShowTranscript] = useState(false)
  const [turns, setTurns]                   = useState<Turn[]>(INITIAL_TURNS)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns])

  function handlePTTStart() {
    setRecordingState('recording')
  }

  function handlePTTEnd() {
    setRecordingState('processing')
    // Short delay then show transcript review
    setTimeout(() => {
      setRecordingState('awaiting_review')
      setShowTranscript(true)
    }, 800)
  }

  function handleConfirmTranscript() {
    setShowTranscript(false)
    setTurns((prev) => [
      ...prev,
      {
        side: 'user',
        text: 'Oui, je pensais partir en juillet ou août. Quelles destinations me recommandez-vous\u00a0?',
      },
    ])
    setRecordingState('idle')
  }

  function handleRedoTranscript() {
    setShowTranscript(false)
    setRecordingState('idle')
  }

  function handleStartConversation() {
    setBriefExpanded(false)
    setBriefDismissed(true)
  }

  function handleEndConversation() {
    router.push('/speaking/feedback/placeholder')
  }

  const userTurnCount = turns.filter((t) => t.side === 'user').length

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
      <div style={{ maxWidth: 440, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Top bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: BG,
            borderBottom: '1px solid #1A1A1A0A',
            padding: '10px 12px 10px',
            minHeight: 80,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => {
                if (confirm('End this session?')) router.push('/speaking/tache-2')
              }}
              aria-label="Go back"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK, display: 'flex' }}
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: 11, color: INK_MUTED, margin: '0 0 2px', letterSpacing: '0.04em' }}>
                T&acirc;che 2 &middot; Role-play
              </p>
              <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 17, color: INK, margin: 0 }}>
                L&apos;agence de voyages
              </p>
            </div>
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute voice' : 'Mute voice'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK_MUTED, display: 'flex' }}
            >
              {muted ? <VolumeX size={20} strokeWidth={1.75} /> : <Volume2 size={20} strokeWidth={1.75} />}
            </button>
          </div>
          <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 12, color: INK_MUTED, textAlign: 'center', margin: 0 }}>
            You&apos;re talking to: travel agent &middot; Register: Formel
          </p>
        </header>

        {/* Brief panel */}
        {!briefDismissed ? (
          <div
            style={{
              margin: '12px 20px 0',
              backgroundColor: SAGE,
              borderRadius: 20,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div style={{ padding: '16px 18px' }}>
              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: INK_MUTED,
                  margin: '0 0 6px',
                }}
              >
                Your role
              </p>
              <p style={{ fontWeight: 500, fontSize: 14, lineHeight: '21px', color: INK, margin: '0 0 12px' }}>
                You want to plan a vacation to a French-speaking country. Ask the agent everything you need to choose the perfect destination.
              </p>
              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: INK_MUTED,
                  margin: '0 0 6px',
                }}
              >
                Info to gather:
              </p>
              <ul style={{ margin: '0 0 16px', paddingLeft: 18 }}>
                {INFO_TARGETS.map((t) => (
                  <li key={t} style={{ fontWeight: 500, fontSize: 13, lineHeight: '21px', color: INK_SOFT }}>{t}</li>
                ))}
              </ul>
              <button
                onClick={handleStartConversation}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: INK,
                  color: '#FFFFFF',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 15,
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                Start conversation
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed brief chip */
          <div style={{ margin: '8px 20px 0', flexShrink: 0 }}>
            <button
              onClick={() => setBriefExpanded((e) => !e)}
              style={{
                background: SAGE,
                border: 'none',
                borderRadius: 100,
                padding: '6px 14px',
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 12,
                color: INK_SOFT,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View your role
              {briefExpanded ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
            </button>
          </div>
        )}

        {/* Scrollable conversation — FIX 3: extra bottom padding during recording so last bubble stays visible */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            paddingBottom: recordingState === 'recording' ? 340 : 220,
            transition: 'padding-bottom 0.2s ease',
          }}
        >
          {turns.map((turn, i) => (
            <ChatBubble
              key={i}
              side={turn.side}
              senderLabel={turn.side === 'examiner' ? "L'agent de voyages" : 'Vous'}
              text={turn.text}
              showAudio={turn.side === 'examiner'}
              bubbleColor={SAGE}
            />
          ))}

          {/* Wrap-up hint after 8 user turns */}
          {userTurnCount >= 8 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={handleEndConversation}
                style={{
                  backgroundColor: SAGE,
                  border: 'none',
                  borderRadius: 100,
                  padding: '8px 16px',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: 13,
                  color: INK_SOFT,
                  cursor: 'pointer',
                }}
              >
                You&apos;ve gathered a lot of information. End conversation?
              </button>
            </div>
          )}
        </div>

        {/* Fixed PTT recording area */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: 440,
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #1A1A1A14',
            padding: '20px 24px 20px',
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

            {/* Timer when recording */}
            {recordingState === 'recording' && (
              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 800,
                  fontSize: 22,
                  color: INK,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                0:{String(pttTimer).padStart(2, '0')}
              </p>
            )}

            <RecordButton
              mode="ptt"
              recordingState={recordingState}
              idleColor={SAGE}
              onPTTStart={handlePTTStart}
              onPTTEnd={handlePTTEnd}
            />

            {recordingState === 'recording' && <VuMeter active color={INK} />}

            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 14,
                color: INK,
                margin: 0,
                textAlign: 'center',
              }}
            >
              {recordingState === 'idle'      ? 'Hold to talk' :
               recordingState === 'recording' ? 'Recording… release to stop' :
               recordingState === 'processing' ? 'Processing…' :
               'Reviewing\u2026'}
            </p>

            {recordingState === 'idle' && (
              <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 12, color: INK_MUTED, margin: 0, textAlign: 'center' }}>
                Press and hold the button to speak
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={handleEndConversation}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 13,
                color: INK_MUTED,
                padding: 0,
              }}
            >
              End conversation
            </button>
          </div>
        </div>

      </div>

      {/* Transcript review panel */}
      <TranscriptReviewPanel
        visible={showTranscript}
        transcript="Oui, je pensais partir en juillet ou août. Quelles destinations me recommandez-vous\u00a0?"
        onConfirm={handleConfirmTranscript}
        onRedo={handleRedoTranscript}
      />
    </div>
  )
}
