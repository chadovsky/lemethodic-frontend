'use client'

import { useState } from 'react'
import Image from 'next/image'

type Language = 'en' | 'es'

interface LanguageSelectProps {
  onContinue: (language: Language) => void
}

const languages: {
  id: Language
  label: string
  icon: string
  iconAlt: string
}[] = [
  {
    id: 'en',
    label: 'English',
    icon: '/icon-flag-gb.png',
    iconAlt: 'United Kingdom flag',
  },
  {
    id: 'es',
    label: 'Español',
    icon: '/icon-flag-es.png',
    iconAlt: 'Spanish flag',
  },
]

export default function LanguageSelect({ onContinue }: LanguageSelectProps) {
  const [selected, setSelected] = useState<Language | null>(null)

  function handleSelect(lang: Language) {
    setSelected(lang)
  }

  function handleContinue() {
    if (selected) onContinue(selected)
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ backgroundColor: '#FFD8C2' }}
    >
      {/* Inner column */}
      <div className="w-full max-w-[440px] flex flex-col flex-1 min-h-screen px-5">

        {/* Progress dots — step 1 current, only 1 filled */}
        <div className="flex items-center justify-center gap-2 pt-4" aria-label="Step 1 of 6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === 0 ? 20 : 8,
                height: 8,
                backgroundColor: i === 0 ? '#1A1A1A' : 'transparent',
                border: i === 0 ? 'none' : '1.5px solid #1A1A1A66',
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Illustration */}
        <div className="flex justify-center mt-10">
          <Image
            src="/illustration-language.jpg"
            alt="3D speech bubble with globe illustration"
            width={160}
            height={160}
            className="object-contain"
            style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.12))' }}
            priority
          />
        </div>

        {/* Headline */}
        <h1
          className="text-center mt-8 leading-tight text-balance"
          style={{
            fontFamily: "'Cabinet Grotesk', 'Geist', sans-serif",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: '40px',
            color: '#1A1A1A',
          }}
        >
          Choose your language
        </h1>

        {/* Descriptor */}
        <p
          className="text-center mt-3 mx-auto text-pretty"
          style={{
            fontWeight: 500,
            fontSize: 15,
            lineHeight: '24px',
            color: '#1A1A1AB3',
            maxWidth: 320,
          }}
        >
          We will use this for menus and instructions. You will always speak French during practice.
        </p>

        {/* Language cards */}
        <div className="flex flex-col gap-[14px] mt-10">
          {languages.map((lang) => {
            const isSelected = selected === lang.id
            return (
              <button
                key={lang.id}
                aria-pressed={isSelected}
                onClick={() => handleSelect(lang.id)}
                className="flex items-center justify-between w-full text-left transition-all duration-150"
                style={{
                  minHeight: 88,
                  backgroundColor: '#FFFFFFCC',
                  borderRadius: 24,
                  padding: '0 24px',
                  border: isSelected ? '2px solid #1A1A1A' : '2px solid transparent',
                  boxShadow: isSelected
                    ? '0 4px 16px rgba(0,0,0,0.08)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                onPointerDown={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)'
                }}
                onPointerUp={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = isSelected
                    ? 'scale(1.01)'
                    : 'scale(1)'
                }}
                onPointerLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = isSelected
                    ? 'scale(1.01)'
                    : 'scale(1)'
                }}
              >
                {/* Left: icon + label */}
                <div className="flex items-center gap-4">
                  <Image
                    src={lang.icon}
                    alt={lang.iconAlt}
                    width={44}
                    height={44}
                    className="object-contain shrink-0"
                    style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.14))' }}
                  />
                  <span
                    style={{
                      fontFamily: "'Cabinet Grotesk', 'Geist', sans-serif",
                      fontWeight: 700,
                      fontSize: 17,
                      color: '#1A1A1A',
                    }}
                  >
                    {lang.label}
                  </span>
                </div>

                {/* Right: checkmark or chevron */}
                <div
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: 24,
                    height: 24,
                    flexShrink: 0,
                  }}
                >
                  {isSelected ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="11" fill="#1A1A1A" />
                      <path
                        d="M6.5 11.2L9.5 14.5L15.5 8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 3L11 8L6 13"
                        stroke="#1A1A1A66"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Continue button */}
        <div className="pb-5">
          <button
            onClick={handleContinue}
            disabled={!selected}
            aria-disabled={!selected}
            className="w-full transition-all duration-200"
            style={{
              height: 56,
              backgroundColor: selected ? '#1A1A1A' : '#1A1A1A4D',
              color: '#FFFFFF',
              borderRadius: 16,
              fontFamily: "'Cabinet Grotesk', 'Geist', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              lineHeight: '24px',
              border: 'none',
              cursor: selected ? 'pointer' : 'not-allowed',
              outline: 'none',
              letterSpacing: '-0.01em',
            }}
            onPointerDown={(e) => {
              if (selected) {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)'
              }
            }}
            onPointerUp={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            }}
            onPointerLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
