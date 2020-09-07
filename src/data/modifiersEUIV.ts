import {ListDefinition, ListDefinitions } from 'types'


import techDataEUIV from './json/euiv/tech.json'
import policyDataEUIV from './json/euiv/policies.json'

// Bit ugly but these enable tree shaking based on the game.
export const techEUIV = process.env.REACT_APP_GAME === 'euiv' ? Array.from(techDataEUIV) as ListDefinition[] : []
export const policiesEUIV = process.env.REACT_APP_GAME === 'euiv' ? policyDataEUIV as ListDefinitions: {}
