import type { MDXComponents } from 'mdx/types'
import Chunk from '@/components/iles/molds/Chunk'
import ActeDeParole from '@/components/iles/molds/ActeDeParole'
import Regle from '@/components/iles/molds/Regle'
import Son from '@/components/iles/molds/Son'
import Activite from '@/components/iles/molds/Activite'
import Tache from '@/components/iles/molds/Tache'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Chunk,
    ActeDeParole,
    Regle,
    Son,
    Activite,
    Tache,
    ...components,
  }
}
