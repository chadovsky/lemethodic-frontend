import type { CollectionConfig } from 'payload'

// Upload collection backed by DigitalOcean Spaces via @payloadcms/storage-s3.
// The s3Storage plugin in payload.config.ts intercepts uploads and stores the
// file in DO Spaces; this collection holds the metadata (alt, filename, URL).
export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  admin: {
    useAsTitle: 'alt',
    description:
      'Images and files for blog posts, testimonials, and OG images. Files are stored on DigitalOcean Spaces (fra1).',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Describe the image for screen readers and search engines.',
      },
    },
  ],
}
