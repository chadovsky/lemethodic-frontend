import type { CollectionConfig } from 'payload'

// Admin-only users for the Payload CMS. Completely separate from the
// product's own auth (FastAPI JWT + Zustand). These credentials grant
// access to /admin and nothing else in the product.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [],
}
