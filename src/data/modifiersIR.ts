import { flatten, groupBy, sortBy } from 'lodash'
import {
  OptionDefinition,
  ListDefinitions,
  DeityDefinitions,
  DictionaryData,
  OptionData,
  Traditions,
  InventionDefinition
} from 'types'

import traditionData from './json/ir/traditions.json'
import tradeData from './json/ir/trades.json'
import heritageData from './json/ir/heritages.json'
import cultureData from './json/ir/cultures.json'
import inventionData from './json/ir/inventions.json'
import traitData from './json/ir/traits.json'
import lawData from './json/ir/laws.json'
import policyData from './json/ir/policies.json'
import ideaData from './json/ir/ideas.json'
import abilityData from './json/ir/abilities.json'
import countryData from './json/ir/countries.json'
import territoryData from './json/ir/territories.json'
import deityData from './json/ir/deities.json'
import religionData from './json/ir/religions.json'
import factionData from './json/ir/parties.json'
import effectData from './json/ir/effects.json'
import { toArr } from 'utils'

// Bit ugly but these enable tree shaking based on the game.
const getPolicies = () => (process.env.REACT_APP_GAME === 'IR' ? Array.from(policyData) : ([] as OptionData[]))
const getAbilities = () => (process.env.REACT_APP_GAME === 'IR' ? Array.from(abilityData) : ([] as OptionData[]))

export const abilitiesIR = sortBy<OptionData>(getAbilities(), () => 1) as OptionDefinition[]
export const traitsIR = process.env.REACT_APP_GAME === 'IR' ? (traitData as ListDefinitions) : {}
export const heritagesIR = process.env.REACT_APP_GAME === 'IR' ? (heritageData as ListDefinitions) : {}
export const tradesIR = process.env.REACT_APP_GAME === 'IR' ? (tradeData as ListDefinitions) : {}
export const traditionsIR = process.env.REACT_APP_GAME === 'IR' ? (traditionData as Traditions) : {}
export const traditionsArrayIR = flatten(toArr(traditionsIR))
export const ideasIR = process.env.REACT_APP_GAME === 'IR' ? (ideaData as ListDefinitions) : {}
export const lawsIR = process.env.REACT_APP_GAME === 'IR' ? (lawData as ListDefinitions) : {}
export const deitiesIR = process.env.REACT_APP_GAME === 'IR' ? (deityData as DeityDefinitions) : {}
export const policiesIR = sortBy<OptionData>(getPolicies(), () => 1) as OptionDefinition[]
export const countriesIR = process.env.REACT_APP_GAME === 'IR' ? countryData : ({} as DictionaryData)
export const territoriesIR = process.env.REACT_APP_GAME === 'IR' ? territoryData : ({} as DictionaryData)
export const religionsIR = process.env.REACT_APP_GAME === 'IR' ? (religionData as ListDefinitions) : {}
export const factionsIR = process.env.REACT_APP_GAME === 'IR' ? (factionData as ListDefinitions) : {}
export const effectsIR = process.env.REACT_APP_GAME === 'IR' ? (effectData as ListDefinitions) : {}
export const culturesIR = process.env.REACT_APP_GAME === 'IR' ? cultureData : ({} as DictionaryData)
export const inventionsIR = process.env.REACT_APP_GAME === 'IR' ? (inventionData as InventionDefinition[]) : []
export const inventionsByCategoryIR = groupBy(inventionsIR, invention => invention.tech)
