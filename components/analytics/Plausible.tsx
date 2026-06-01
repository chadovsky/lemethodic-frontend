import Script from 'next/script'

// Wire Plausible analytics. Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to your site
// domain (e.g. "lemethodic.com") to activate. Script is omitted when unset
// so local dev stays clean without any extra config.
export function PlausibleAnalytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  if (!domain) return null
  return (
    <Script
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  )
}
