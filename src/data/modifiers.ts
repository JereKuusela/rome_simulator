import { sortBy } from 'lodash'
import { toObj } from 'utils'
import {
  CultureType, ListDefinition, OptionDefinition,
  TraditionDefinition, TechDefinition, ListDefinition2, DeityDefinitions, TradeDefinitions
} from 'types'

import traditionData from './json/ir/traditions.json'
import tradeData from './json/ir/trades.json'
import heritageData from './json/ir/heritages.json'
import techDataIR from './json/ir/tech.json'
import traitData from './json/ir/traits.json'
import lawData from './json/ir/laws.json'
import policyData from './json/ir/policies.json'
import ideaData from './json/ir/ideas.json'
import abilityData from './json/ir/abilities.json'
import countryData from './json/ir/countries.json'
import deityData from './json/ir/deities.json'
import religionData from './json/ir/religions.json'
import factionData from './json/ir/parties.json'
import modifierData from './json/ir/modifiers.json'


import techDataEUIV from './json/euiv/tech.json'

// Bit ugly but these enable tree shaking based on the game.
const getTechDataEUIV = () => process.env.REACT_APP_GAME === 'euiv' ? Array.from(techDataEUIV) : [] as TechDataEUIV[]
const getTraditionData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(traditionData) : [] as TraditionData[]
const getTechDataIR = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(techDataIR) : [] as InventionData[]
const getPolicyData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(policyData) : [] as OptionData[]
const getAbilityData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(abilityData.abilities) : [] as OptionData[]

export type Traditions = { [key in CultureType]: TraditionDefinition }

const getTechDefinitionsEUIV = () => {
  const data = sortBy<TechDataEUIV>(getTechDataEUIV(), () => 1) as ListDefinition[]
  return data
}

export const getTraditionDefinitions = () => {
  const data = toObj(sortBy<TraditionData>(getTraditionData(), value => value.name), value => value.key) as Traditions
  return data
}

const getTechDefinitionsIR = () => {
  const data = sortBy<InventionData>(getTechDataIR(), () => 1) as TechDefinition[]
  return data
}

const getFactionDefinitions = () => process.env.REACT_APP_GAME === 'ir' ? factionData as ListDefinition2 : {}
const getModifierDefinitions = () => process.env.REACT_APP_GAME === 'ir' ? modifierData as ListDefinition2 : {}
const getIdeaDefinitions = () => process.env.REACT_APP_GAME === 'ir' ? ideaData as ListDefinition2 : {}
const getDeityDefinitions = () => process.env.REACT_APP_GAME === 'ir' ? deityData as DeityDefinitions : {}
const getHeritageDefinitions = () => process.env.REACT_APP_GAME === 'ir' ? heritageData as ListDefinition2 : {}
const getLawDefinitions = () => process.env.REACT_APP_GAME === 'ir' ? lawData as ListDefinition2 : {}
const getReligionDefinitions = () => process.env.REACT_APP_GAME === 'ir' ? religionData as ListDefinition2 : {}
const getTraitDefinitions = () => process.env.REACT_APP_GAME === 'ir' ? traitData as ListDefinition2 : {}
const getTradeDefinitions = () => process.env.REACT_APP_GAME === 'ir' ? tradeData as TradeDefinitions : {}

const getPolicyDefinitions = () => {
  const data = sortBy<OptionData>(getPolicyData(), () => 1) as OptionDefinition[]
  return data
}

const getAbilityDefinitions = () => {
  const data = sortBy<OptionData>(getAbilityData(), () => 1) as OptionDefinition[]
  return data
}

const getCountryNames = () => process.env.REACT_APP_GAME === 'ir' ? countryData : {} as DictionaryData

export const abilitiesIR = getAbilityDefinitions()
export const traitsIR = getTraitDefinitions()
export const heritagesIR = getHeritageDefinitions()
export const tradesIR = getTradeDefinitions()
export const traditionsIR = getTraditionDefinitions()
export const ideasIR = getIdeaDefinitions()
export const lawsIR = getLawDefinitions()
export const deitiesIR = getDeityDefinitions()
export const policiesIR = getPolicyDefinitions()
export const countriesIR = getCountryNames()
export const religionsIR = getReligionDefinitions()
export const factionsIR = getFactionDefinitions()
export const modifiersIR = getModifierDefinitions()

export const techIR = getTechDefinitionsIR()
export const techEUIV = getTechDefinitionsEUIV()


interface ModifierData {
  target: string
  attribute: string
  value: number
}

interface TraditionData {
  name: string
  key: string
  modifiers: ModifierData[]
  paths: {
    name: string
    key: string
    traditions: {
      name: string
      key: string
      modifiers: ModifierData[]
    }[]
  }[]
}

interface TechDataEUIV {
  name: string
  modifiers: ModifierData[]
}

interface InventionData {
  name: string
  inventions: {
    name: string
    key: string
    index: number
    modifiers: ModifierData[]
  }[]
}

type ListData = {
  name: string
  key: string
  modifiers: ModifierData[]
}

type OptionData = ListData[]

type DictionaryData = { [key: string]: string }
