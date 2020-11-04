import { sortBy } from 'lodash'
import { toObj } from 'utils'
import {
  OptionDefinition,
  TechDefinition,
  ListDefinitions,
  DeityDefinitions,
  DictionaryData,
  InventionData,
  OptionData,
  TraditionData,
  Traditions
} from 'types'

import traditionData from './json/ir/traditions.json'
import tradeData from './json/ir/trades.json'
import heritageData from './json/ir/heritages.json'
import cultureData from './json/ir/cultures.json'
import techDataIR from './json/ir/tech.json'
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
import modifierData from './json/ir/modifiers.json'

// Bit ugly but these enable tree shaking based on the game.
const getTraditionDataIR = () =>
  process.env.REACT_APP_GAME === 'IR' ? Array.from(traditionData) : ([] as TraditionData[])
const getTechDataIR = () => (process.env.REACT_APP_GAME === 'IR' ? Array.from(techDataIR) : ([] as InventionData[]))
const getPolicyDataIR = () => (process.env.REACT_APP_GAME === 'IR' ? Array.from(policyData) : ([] as OptionData[]))
const getAbilityDataIR = () =>
  process.env.REACT_APP_GAME === 'IR' ? Array.from(abilityData.abilities) : ([] as OptionData[])
const getFactionDefinitionsIR = () => (process.env.REACT_APP_GAME === 'IR' ? (factionData as ListDefinitions) : {})
const getModifierDefinitionsIR = () => (process.env.REACT_APP_GAME === 'IR' ? (modifierData as ListDefinitions) : {})
const getIdeaDefinitionsIR = () => (process.env.REACT_APP_GAME === 'IR' ? (ideaData as ListDefinitions) : {})
const getDeityDefinitionsIR = () => (process.env.REACT_APP_GAME === 'IR' ? (deityData as DeityDefinitions) : {})
const getHeritageDefinitionsIR = () => (process.env.REACT_APP_GAME === 'IR' ? (heritageData as ListDefinitions) : {})
const getLawDefinitionsIR = () => (process.env.REACT_APP_GAME === 'IR' ? (lawData as ListDefinitions) : {})
const getReligionDefinitionsIR = () => (process.env.REACT_APP_GAME === 'IR' ? (religionData as ListDefinitions) : {})
const getTraitDefinitionsIR = () => (process.env.REACT_APP_GAME === 'IR' ? (traitData as ListDefinitions) : {})
const getTradeDefinitionsIR = () => (process.env.REACT_APP_GAME === 'IR' ? (tradeData as ListDefinitions) : {})
const getCountryNames = () => (process.env.REACT_APP_GAME === 'IR' ? countryData : ({} as DictionaryData))
const getTerritoryNames = () => (process.env.REACT_APP_GAME === 'IR' ? territoryData : ({} as DictionaryData))
const getCultureNames = () => (process.env.REACT_APP_GAME === 'IR' ? cultureData : ({} as DictionaryData))

export const abilitiesIR = sortBy<OptionData>(getAbilityDataIR(), () => 1) as OptionDefinition[]
export const traitsIR = getTraitDefinitionsIR()
export const heritagesIR = getHeritageDefinitionsIR()
export const tradesIR = getTradeDefinitionsIR()
export const traditionsIR = toObj(
  sortBy<TraditionData>(getTraditionDataIR(), value => value.name),
  value => value.key
) as Traditions
export const ideasIR = getIdeaDefinitionsIR()
export const lawsIR = getLawDefinitionsIR()
export const deitiesIR = getDeityDefinitionsIR()
export const policiesIR = sortBy<OptionData>(getPolicyDataIR(), () => 1) as OptionDefinition[]
export const countriesIR = getCountryNames()
export const territoriesIR = getTerritoryNames()
export const religionsIR = getReligionDefinitionsIR()
export const factionsIR = getFactionDefinitionsIR()
export const modifiersIR = getModifierDefinitionsIR()
export const culturesIR = getCultureNames()
export const techIR = sortBy<InventionData>(getTechDataIR(), () => 1) as TechDefinition[]
