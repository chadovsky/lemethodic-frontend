'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react'
import ChatBubble from './ChatBubble'
import RecordButton, { RecordingState } from './RecordButton'
import VuMeter from './VuMeter'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const PEACH        = '#FFD8C2'
const BG           = '#FAFAF7'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

type Turn = {
  side: 'examiner' | 'user'
  text: string
}

const INITIAL_TURNS: Turn[] = [
  {
    side: 'examiner',
    text: 'Bonjour. Pour commencer, présentez-vous, s\u2019il vous plaît.',
  },
  {
    side: 'user',
    text: 'Bonjour, je m\u2019appelle Chadi, j\u2019ai 32 ans, j\u2019habite à Casablanca au Maroc.',
  },
  {
    side: 'examiner',
    text: 'Très bien, Chadi. Vous avez dit que vous habitez à Casablanca — pouvez-vous me décrire une journée typique chez vous\u00a0?',
  },
]

export default function Tache1Session() {
  const router = useRouter()
  const [muted, setMuted] = useState(false)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [turns, setTurns] = useState<Turn[]>(INITIAL_TURNS)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when turns change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns])

  const currentTurn = Math.ceil(turns.length / 2)
  const totalTurns  = 4

  function handleTap() {
    if (recordingState === 'idle') {
      setRecordingState('recording')
    } else if (recordingState === 'recording') {
      setRecordingState('processing')
      setTimeout(() => {
        setRecordingState('idle')
      }, 1200)
    }
  }

  function handleEndConversation() {
    router.push('/speaking/feedback/placeholder')
  }

  const statusLabel =
    recordingState === 'idle'       ? 'Tap to record your response' :
    recordingState === 'recording'  ? 'Recording… Tap to stop' :
    recordingState === 'processing' ? 'Processing your response…' :
    'Examiner is thinking…'

  const statusSub =
    recordingState === 'idle' ? "Take your time. There's no timer." : ''

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
            padding: '0 12px',
            height: 64,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Back */}
            <button
              onClick={() => {
                if (confirm('End this session?')) router.push('/speaking')
              }}
              aria-label="End session and go back"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK, display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>

            {/* Center */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 16, color: INK, margin: 0 }}>
                T&acirc;che 1 &middot; Self-presentation
              </p>
            </div>

            {/* Mute */}
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute voice' : 'Mute voice'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK_MUTED, display: 'flex', alignItems: 'center' }}
            >
              {muted ? <VolumeX size={20} strokeWidth={1.75} /> : <Volume2 size={20} strokeWidth={1.75} />}
            </button>
          </div>

          {/* Turn indicator */}
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 11,
              color: INK_MUTED,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Turn {currentTurn} of {totalTurns}
          </p>
        </header>

        {/* Scrollable conversation */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            paddingBottom: 200, // clearance for fixed recording area
          }}
        >
          {turns.map((turn, i) => (
            <ChatBubble
              key={i}
              side={turn.side}
              senderLabel={turn.side === 'examiner' ? 'Examinateur' : 'Vous'}
              text={turn.text}
              showAudio={turn.side === 'examiner'}
              bubbleColor={PEACH}
            />
          ))}
        </div>

        {/* Fixed recording area */}
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
            padding: '24px 24px 20px',
            zIndex: 30,
          }}
        >
          {/* Record button + label */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <RecordButton
              mode="tap"
              recordingState={recordingState}
              idleColor={INK}
              onTap={handleTap}
            />

            {recordingState === 'recording' && (
              <VuMeter active color={INK} />
            )}

            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 15,
                color: INK,
                margin: 0,
                textAlign: 'center',
              }}
            >
              {statusLabel}
            </p>
            {statusSub && (
              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 500,
                  fontSize: 13,
                  color: INK_MUTED,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {statusSub}
              </p>
            )}
          </div>

          {/* End conversation link */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
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
    </div>
  )
}
