import type { CollectionConfig } from 'payload'

export const FAQ: CollectionConfig = {
  slug: 'faq',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'sortOrder'],
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'La Methode', value: 'methode' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Exam', value: 'exam' },
      ],
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
