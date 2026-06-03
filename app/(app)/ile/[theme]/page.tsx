import type { Metadata } from 'next'
import IleShell from '@/components/iles/IleShell'

export const metadata: Metadata = {
  title: 'Île | Le Méthodic',
}

type Params = Promise<{ theme: string }>

export default async function IlePage({ params }: { params: Params }) {
  const { theme } = await params
  return <IleShell theme={theme} />
}
