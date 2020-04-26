import { sortBy } from 'lodash'
import { toObj, forEach, values } from 'utils'
import {
  ValuesType, CultureType, ListDefinition, OptionDefinition,
  TraditionDefinition, TradeDefinition, Modifier, TechDefinition, DeityDefinition, ListDefinition2
} from 'types'

import * as traditionData from './json/ir/traditions.json'
import * as tradeData from './json/ir/trades.json'
import * as heritageData from './json/ir/heritages.json'
import * as techDataIR from './json/ir/tech.json'
import * as traitData from './json/ir/traits.json'
import * as lawData from './json/ir/laws.json'
import * as policyData from './json/ir/policies.json'
import * as ideaData from './json/ir/ideas.json'
import * as abilityData from './json/ir/abilities.json'
import * as countryData from './json/ir/countries.json'
import * as deityData from './json/ir/deities.json'
import * as religionData from './json/ir/religions.json'
import * as factionData from './json/ir/parties.json'
import * as modifierData from './json/ir/modifiers.json'


import * as techDataEUIV from './json/euiv/tech.json'

// Bit ugly but these enable tree shaking based on the game.
const getTechDataEUIV = () => process.env.REACT_APP_GAME === 'euiv' ? Array.from(techDataEUIV) : [] as TechDataEUIV[]
const getTraditionData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(traditionData) : [] as TraditionData[]
const getTradeData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(tradeData) : [] as TradeData[]
const getHeritageData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(heritageData) : [] as ListData[]
const getTechDataIR = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(techDataIR) : [] as InventionData[]
const getTraitData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(traitData) : [] as ListData[]
const getLawData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(lawData) : [] as ListData[]
const getPolicyData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(policyData) : [] as OptionData[]
const getIdeaData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(ideaData) : [] as ListData[]
const getReligionData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(religionData) : [] as ListData[]
const getAbilityData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(abilityData.abilities) : [] as OptionData[]
const getCountryData = () => process.env.REACT_APP_GAME === 'ir' ? countryData : {} as DictionaryData
const getDeityData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(deityData) : [] as DeityData[]
const getModifierData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(modifierData) : [] as ListData[]

export type Traditions = { [key in CultureType]: TraditionDefinition }

const getTechDefinitionsEUIV = () => {
  const data = sortBy<TechDataEUIV>(getTechDataEUIV(), () => 1) as ListDefinition[]
  return data
}

export const getTraditionDefinitions = () => {
  const data = toObj(sortBy<TraditionData>(getTraditionData(), value => value.name), value => value.key) as Traditions
  return data
}

const getTradeDefinitions = () => {
  const data = sortBy<TradeData>(getTradeData(), value => value.name) as TradeDefinition[]
  return data
}

const getHeritageDefinitions = () => {
  const data = sortBy<ListData>(getHeritageData(), value => value.name) as ListDefinition[]
  return data
}

const getTechDefinitionsIR = () => {
  const data = sortBy<InventionData>(getTechDataIR(), () => 1) as TechDefinition[]
  return data
}

const getTraitDefinitions = () => {
  const data = sortBy<ListData>(getTraitData(), value => value.name) as ListDefinition[]
  return data
}

const getReligionDefinitions = () => {
  const data = sortBy<ListData>(getReligionData(), value => value.name) as ListDefinition[]
  return data
}

const getFactionDefinitions = () => process.env.REACT_APP_GAME === 'ir' ? factionData as ListDefinition2 : {}

const getModifierDefinitions = () => {
  const data = sortBy<ListData>(getModifierData(), value => value.name) as ListDefinition[]
  return data
}

const getLawDefinitions = () => {
  const data = sortBy<ListData>(getLawData(), () => 1) as ListDefinition[]
  return data
}

const getPolicyDefinitions = () => {
  const data = sortBy<OptionData>(getPolicyData(), () => 1) as OptionDefinition[]
  return data
}

const getIdeaDefinitions = () => {
  const data = sortBy<ListData>(getIdeaData(), () => 1) as ListDefinition[]
  return data
}

const getDeityDefinitions = () => {
  const data = sortBy<DeityData>(getDeityData(), () => 1) as DeityDefinition[]
  return data
}

const getAbilityDefinitions = () => {
  const data = sortBy<OptionData>(getAbilityData(), () => 1) as OptionDefinition[]
  return data
}

const getCountryNames = () => getCountryData()

export const abilities_ir = getAbilityDefinitions()
export const traits_ir = getTraitDefinitions()
export const heritages_ir = getHeritageDefinitions()
export const trades_ir = getTradeDefinitions()
export const traditions_ir = getTraditionDefinitions()
export const ideas_ir = getIdeaDefinitions()
export const laws_ir = getLawDefinitions()
export const deities_ir = getDeityDefinitions()
export const policies_ir = getPolicyDefinitions()
export const countries_ir = getCountryNames()
export const religions_ir = getReligionDefinitions()
export const factions_ir = getFactionDefinitions()
export const modifiers_ir = getModifierDefinitions()

export const tech_ir = getTechDefinitionsIR()
export const tech_euiv = getTechDefinitionsEUIV()


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

interface TradeData {
  name: String
  key: string
  index: number
  modifiers: ModifierData[]
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

type ListData2 = { [key: string]: ListData }

type DeityData = ListData & {
  isOmen: boolean
}

type OptionData = ListData[]

type DictionaryData = { [key: string]: string }
