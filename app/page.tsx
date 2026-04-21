'use client'

import LanguageSelect from '@/components/onboarding/LanguageSelect'

export default function Home() {
  function handleContinue(language: 'en' | 'es') {
    console.log('[FluentPath] Selected language:', language)
    // Navigate to next onboarding screen
  }

  return <LanguageSelect onContinue={handleContinue} />
}
