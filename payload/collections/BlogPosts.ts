import type { CollectionConfig } from 'payload'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'slug'],
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
        description: 'URL slug, e.g. "how-to-score-b2-tcf". No leading slash.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'excerpt',
      type: 'text',
      admin: {
        description: 'Max 160 characters. Used for SEO meta description and card previews.',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'seoTitle',
      type: 'text',
    },
    {
      name: 'seoDescription',
      type: 'text',
    },
  ],
}
