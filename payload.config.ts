import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { Users } from './payload/collections/Users'
import { Media } from './payload/collections/Media'
import { Pages } from './payload/collections/Pages'
import { BlogPosts } from './payload/collections/BlogPosts'
import { Testimonials } from './payload/collections/Testimonials'
import { FAQ } from './payload/collections/FAQ'

export default buildConfig({
  admin: {
    user: 'users',
  },

  collections: [Users, Media, Pages, BlogPosts, Testimonials, FAQ],

  editor: lexicalEditor(),

  // All Payload tables land in the payload_cms schema on the existing
  // DigitalOcean Postgres instance (Option A, approved 2026-06-01).
  // Dev: point DATABASE_URI at a local container (see .env.example).
  // Prod: founder provides a dedicated user scoped to this schema only.
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? '',
    },
    schemaName: 'payload_cms',
  }),

  // Media files go to DigitalOcean Spaces (S3-compatible).
  // The project already uses DO Spaces (fra1) for audio via the BE;
  // CMS media uploads land in a /cms prefix in the same or a new bucket.
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'cms',
          generateFileURL: ({ filename, prefix }) =>
            `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION ?? 'fra1'}.digitaloceanspaces.com/${prefix ?? 'cms'}/${filename}`,
        },
      },
      bucket: process.env.DO_SPACES_BUCKET ?? '',
      config: {
        credentials: {
          accessKeyId: process.env.DO_SPACES_KEY ?? '',
          secretAccessKey: process.env.DO_SPACES_SECRET ?? '',
        },
        endpoint: `https://${process.env.DO_SPACES_REGION ?? 'fra1'}.digitaloceanspaces.com`,
        region: process.env.DO_SPACES_REGION ?? 'fra1',
        forcePathStyle: false,
      },
    }),
  ],

  secret: process.env.PAYLOAD_SECRET ?? '',

  typescript: {
    outputFile: 'payload-types.ts',
  },
})
