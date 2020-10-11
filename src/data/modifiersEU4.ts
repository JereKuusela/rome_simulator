import {ListDefinition, ListDefinitions } from 'types'


import techDataEU4 from './json/eu4/tech.json'
import policyDataEU4 from './json/eu4/policies.json'


// Bit ugly but these enable tree shaking based on the game.
export const techEU4 = process.env.REACT_APP_GAME === 'EU4' ? Array.from(techDataEU4) as ListDefinition[] : []
export const policiesEU4 = process.env.REACT_APP_GAME === 'EU4' ? policyDataEU4 as ListDefinitions: {}
