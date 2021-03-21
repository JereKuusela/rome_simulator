import { DataEntryEU4 } from 'types'

import techDataEU4 from './json/eu4/tech.json'
import policyDataEU4 from './json/eu4/policies.json'

export type ListDefinitions = Record<string, DataEntryEU4>

// Bit ugly but these enable tree shaking based on the game.
export const techEU4 = process.env.REACT_APP_GAME === 'EU4' ? (Array.from(techDataEU4) as DataEntryEU4[]) : []
export const policiesEU4 = process.env.REACT_APP_GAME === 'EU4' ? (policyDataEU4 as ListDefinitions) : {}
