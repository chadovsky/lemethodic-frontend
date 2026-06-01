import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'attribution',
    defaultColumns: ['attribution', 'examContext', 'featured', 'sortOrder'],
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'attribution',
      type: 'text',
      required: true,
      admin: {
        description: 'e.g. "Marie-Claire T., CLB 10"',
      },
    },
    {
      name: 'examContext',
      type: 'text',
      admin: {
        description: 'e.g. "TCF Canada, Quebec PR"',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show this testimonial on the landing page.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first.',
      },
    },
  ],
}
