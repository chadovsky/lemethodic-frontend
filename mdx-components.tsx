import type { MDXComponents } from 'mdx/types'
import Chunk from '@/components/iles/molds/Chunk'
import ActeDeParole from '@/components/iles/molds/ActeDeParole'
import Regle from '@/components/iles/molds/Regle'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Chunk,
    ActeDeParole,
    Regle,
    ...components,
  }
}
