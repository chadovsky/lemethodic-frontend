// F-310.fe.captcha — hCaptcha sitekey resolver.
//
// Production sitekey lands via `NEXT_PUBLIC_HCAPTCHA_SITEKEY` in Vercel
// once Chadi provisions the hCaptcha account. Until then (and in dev /
// preview), this falls back to the hCaptcha public test sitekey
// `10000000-ffff-ffff-ffff-000000000001` — that key always passes
// verification on hCaptcha's side, so the widget renders + tokens
// generate normally during development without needing a real account.
//
// BE schema marks `hcaptcha_token` nullable: when the widget hasn't
// rendered yet or the user hasn't completed the challenge, callers
// should send `null` (not omit the field). The token is the verified
// passcode hCaptcha returns to the FE; the BE re-verifies with
// hCaptcha's API before accepting the registration / reset request.

export const HCAPTCHA_TEST_SITEKEY = '10000000-ffff-ffff-ffff-000000000001'

export function resolveHcaptchaSitekey(): string {
  const env = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY
  if (env && env.trim().length > 0) return env
  return HCAPTCHA_TEST_SITEKEY
}
