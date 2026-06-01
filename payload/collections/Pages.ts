import type { CollectionConfig } from 'payload'

// Secondary and long-form content pages: methodology explanation, about,
// legal variants, etc. The high-conversion landing page is NOT managed here
// (it is a coded component). This collection is for founder-editable copy
// that does not require a code deploy to update.
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    description:
      'Secondary content pages (methodology, about, legal). The main landing page is a coded component and is not managed here.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL path segment, e.g. "methode" renders at /methode. No leading slash.',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'seoTitle',
      type: 'text',
      admin: {
        description: 'Overrides the page title in <title> and OG tags. Leave blank to use Title.',
      },
    },
    {
      name: 'seoDescription',
      type: 'text',
      admin: {
        description: 'Meta description. Aim for 120-160 characters.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'Leave blank to keep as draft. Set a date to make the page live.',
      },
    },
  ],
}
