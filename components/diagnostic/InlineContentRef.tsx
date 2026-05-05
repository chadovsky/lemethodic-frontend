'use client'

// F-080c — render a single inline_markdown content_ref via react-markdown.
// Document/audio/external_link content_refs are stubbed for V1; F-081 ships
// audio drills, F-082 ships interactive drills, and document hosting is
// out of scope until authored content needs it.

import ReactMarkdown from 'react-markdown'
import type { ModuleContentRef } from '@/lib/types'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface Props {
  ref_: ModuleContentRef
}

export default function InlineContentRef({ ref_ }: Props) {
  const lang = useInterfaceLanguage()

  switch (ref_.type) {
    case 'inline_markdown': {
      // ES falls back to EN.
      const body =
        (lang === 'fr' ? ref_.content_fr : ref_.content_en) ?? ref_.content_en ?? ''
      if (!body) return null
      return (
        <div
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 14,
            lineHeight: '22px',
            color: INK,
          }}
        >
          <ReactMarkdown
            components={{
              h1: (props) => (
                <h2
                  style={{
                    margin: '8px 0 6px',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 800,
                    fontSize: 18,
                    color: INK,
                  }}
                  {...props}
                />
              ),
              h2: (props) => (
                <h3
                  style={{
                    margin: '14px 0 6px',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 800,
                    fontSize: 16,
                    color: INK,
                  }}
                  {...props}
                />
              ),
              h3: (props) => (
                <h4
                  style={{
                    margin: '10px 0 4px',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 14,
                    color: INK,
                  }}
                  {...props}
                />
              ),
              p: (props) => (
                <p
                  style={{
                    margin: '0 0 10px',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '22px',
                    color: INK_SOFT,
                  }}
                  {...props}
                />
              ),
              strong: (props) => (
                <strong style={{ color: INK, fontWeight: 700 }} {...props} />
              ),
              em: (props) => (
                <em style={{ fontStyle: 'italic', color: INK }} {...props} />
              ),
              ul: (props) => (
                <ul
                  style={{
                    margin: '0 0 10px',
                    paddingLeft: 22,
                    color: INK_SOFT,
                  }}
                  {...props}
                />
              ),
              ol: (props) => (
                <ol
                  style={{
                    margin: '0 0 10px',
                    paddingLeft: 22,
                    color: INK_SOFT,
                  }}
                  {...props}
                />
              ),
              li: (props) => (
                <li
                  style={{
                    margin: '0 0 4px',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '22px',
                  }}
                  {...props}
                />
              ),
              code: (props) => (
                <code
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 13,
                    backgroundColor: '#1A1A1A0A',
                    padding: '1px 4px',
                    borderRadius: 4,
                  }}
                  {...props}
                />
              ),
              hr: () => (
                <hr
                  style={{
                    border: 'none',
                    borderTop: '1px solid #1A1A1A14',
                    margin: '12px 0',
                  }}
                />
              ),
            }}
          >
            {body}
          </ReactMarkdown>
        </div>
      )
    }

    case 'document':
    case 'audio':
    case 'external_link':
      return (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px dashed #1A1A1A24',
            borderRadius: 14,
            padding: '14px 16px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: INK_MUTED,
            }}
          >
            {ref_.type === 'audio' ? 'Audio drill' : ref_.type === 'document' ? 'Document' : 'External resource'}
          </p>
          <p
            style={{
              margin: '6px 0 0',
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 13,
              color: INK_SOFT,
            }}
          >
            {ref_.description ?? 'Coming soon.'}
          </p>
        </div>
      )

    default:
      return null
  }
}
