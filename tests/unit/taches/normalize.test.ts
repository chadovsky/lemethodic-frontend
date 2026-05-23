import { describe, expect, it } from 'vitest'
import {
  normalizeTache1,
  normalizeTache2Scenario,
  normalizeTache3Topic,
  type RawTache2Scenario,
  type RawTache3Topic,
} from '@/lib/taches/normalize'

describe('normalizeTache1', () => {
  it('returns a Tache with id 1 and durationSeconds 180', () => {
    const t = normalizeTache1()
    expect(t.id).toBe(1)
    expect(t.durationSeconds).toBe(180)
  })

  it('title contains "Échange d\'informations"', () => {
    const t = normalizeTache1()
    expect(t.title).toContain("Échange d'informations")
  })
})

describe('RawTache2Scenario shape', () => {
  it('accepts a well-formed raw scenario object', () => {
    const raw: RawTache2Scenario = { id: 7, code: 'agence_voyages', difficulty: 'B1_B2' }
    expect(raw.id).toBe(7)
    expect(raw.code).toBe('agence_voyages')
    expect(raw.difficulty).toBe('B1_B2')
  })
})

describe('normalizeTache2Scenario', () => {
  it('returns a Tache with id 2 and durationSeconds 210', () => {
    const raw: RawTache2Scenario = { id: 7, code: 'agence_voyages', difficulty: 'B1_B2' }
    const t = normalizeTache2Scenario(raw)
    expect(t.id).toBe(2)
    expect(t.durationSeconds).toBe(210)
  })

  it('uses the scenario code as the prompt', () => {
    const raw: RawTache2Scenario = { id: 7, code: 'agence_voyages', difficulty: 'B1_B2' }
    const t = normalizeTache2Scenario(raw)
    expect(t.prompt).toBe('agence_voyages')
  })
})

describe('RawTache3Topic shape', () => {
  it('accepts a well-formed raw topic object', () => {
    const raw: RawTache3Topic = {
      id: 3,
      title: 'Réseaux sociaux',
      theme: 'Société',
      sous_theme: 'Numérique',
      difficulty: 'B2_C1',
      prompt_fr: 'Comparez les avantages.',
      prompt_en: 'Compare the advantages.',
      prompt_es: 'Compare las ventajas.',
    }
    expect(raw.id).toBe(3)
    expect(raw.prompt_fr).toBe('Comparez les avantages.')
  })
})

describe('normalizeTache3Topic', () => {
  const RAW: RawTache3Topic = {
    id: 3,
    title: 'Réseaux sociaux',
    theme: 'Société',
    sous_theme: 'Numérique',
    difficulty: 'B2_C1',
    prompt_fr: 'Comparez les avantages.',
    prompt_en: 'Compare the advantages.',
    prompt_es: 'Compare las ventajas.',
  }

  it('returns a Tache with id 3 and durationSeconds 300', () => {
    const t = normalizeTache3Topic(RAW)
    expect(t.id).toBe(3)
    expect(t.durationSeconds).toBe(300)
  })

  it('uses prompt_fr as the prompt', () => {
    const t = normalizeTache3Topic(RAW)
    expect(t.prompt).toBe('Comparez les avantages.')
  })
})
