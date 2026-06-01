/**
 * Payload TypeScript types for Le Methodic CMS collections.
 *
 * This file was written manually because `pnpm payload generate:types` cannot
 * run on Node.js v24 + tsx 4.21 on Windows due to a worker-thread ESM module
 * resolution limitation (tsx cannot remap bare .ts imports inside worker
 * threads spawned by the Payload CLI).
 *
 * To regenerate with the official CLI once the environment is resolved:
 *   pnpm payload generate:types
 * Requires DATABASE_URI to point at a running Postgres instance with the
 * payload_cms schema created. Runs cleanly on Node.js 22 LTS.
 */

// ─── Core config ─────────────────────────────────────────────────────────────

export interface Config {
  auth: {
    users: UserAuthOperations
  }
  collections: {
    users: User
    media: Media
    pages: Page
    'blog-posts': BlogPost
    testimonials: Testimonial
    faq: Faq
  }
  collectionsJoins: {}
  collectionsSelect: {
    users: UsersSelect
    media: MediaSelect
    pages: PagesSelect
    'blog-posts': BlogPostsSelect
    testimonials: TestimonialsSelect
    faq: FaqSelect
  }
  db: { defaultIDType: number }
  globals: {}
  globalsSelect: {}
  locale: never
  user: User & { collection: 'users' }
}

// ─── Auth operations ─────────────────────────────────────────────────────────

export type UserAuthOperations = {
  forgotPassword: { email: string; password: string }
  login: { email: string; password: string }
  registerFirstUser: { email: string; password: string }
  unlock: { email: string }
}

// ─── Shared ───────────────────────────────────────────────────────────────────

type Timestamps = { updatedAt: string; createdAt: string }

export type SerializedEditorState = {
  root: {
    type: string
    children: SerializedLexicalNode[]
    direction: 'ltr' | 'rtl' | null
    format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'
    indent: number
    version: number
  }
}

export type SerializedLexicalNode = {
  type: string
  version: number
  [key: string]: unknown
}

// ─── Collections ─────────────────────────────────────────────────────────────

export interface User extends Timestamps {
  id: number
  email: string
  resetPasswordToken?: string | null
  resetPasswordExpiration?: string | null
  salt?: string | null
  hash?: string | null
  loginAttempts?: number | null
  lockUntil?: string | null
  password?: string | null
}

export interface Media extends Timestamps {
  id: number
  alt: string
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
}

export interface Page extends Timestamps {
  id: number
  title: string
  slug: string
  body?: SerializedEditorState | null
  seoTitle?: string | null
  seoDescription?: string | null
  publishedAt?: string | null
}

export interface BlogPost extends Timestamps {
  id: number
  title: string
  slug: string
  publishedAt: string
  featuredImage?: number | Media | null
  excerpt?: string | null
  body?: SerializedEditorState | null
  seoTitle?: string | null
  seoDescription?: string | null
}

export interface Testimonial extends Timestamps {
  id: number
  quote: string
  attribution: string
  examContext?: string | null
  featured?: boolean | null
  sortOrder?: number | null
}

export interface Faq extends Timestamps {
  id: number
  question: string
  answer?: SerializedEditorState | null
  category?: 'general' | 'methode' | 'pricing' | 'exam' | null
  sortOrder?: number | null
}

// ─── Select types (field projections) ────────────────────────────────────────

export type UsersSelect = { [K in keyof User]?: boolean }
export type MediaSelect = { [K in keyof Media]?: boolean }
export type PagesSelect = { [K in keyof Page]?: boolean }
export type BlogPostsSelect = { [K in keyof BlogPost]?: boolean }
export type TestimonialsSelect = { [K in keyof Testimonial]?: boolean }
export type FaqSelect = { [K in keyof Faq]?: boolean }
