import { sortBy } from 'lodash'
import { toObj, forEach } from 'utils'
import {
  ValuesType, CultureType, ListDefinition, OptionDefinition,
  TraditionDefinition, TradeDefinition, Modifier, TechDefinition, DeityDefinition
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

import * as techDataEUIV from './json/euiv/tech.json'

// Bit ugly but these enable tree shaking based on the game.
const getTechDataEUIV = () => process.env.REACT_APP_GAME === 'euiv' ? Array.from(techDataEUIV.tech) : [] as TechDataEUIV[]
const getTraditionData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(traditionData.traditions) : [] as TraditionData[]
const getTradeData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(tradeData.trades) : [] as TradeData[]
const getHeritageData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(heritageData.heritages) : [] as ListData[]
const getTechDataIR = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(techDataIR.tech) : [] as InventionData[]
const getTraitData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(traitData.traits) : [] as ListData[]
const getLawData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(lawData.laws) : [] as ListData[]
const getPolicyData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(policyData.policies) : [] as OptionData[]
const getIdeaData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(ideaData.ideas) : [] as ListData[]
const getAbilityData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(abilityData.abilities) : [] as OptionData[]
const getCountryData = () => process.env.REACT_APP_GAME === 'ir' ? countryData.countries : {} as DictionaryData
const getDeityData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(deityData.deities) : [] as DeityData[]

export type Traditions = { [key in CultureType ]: TraditionDefinition }

const setDefault = (modifier: Modifier) => {
  modifier.type = modifier.type ?? ValuesType.Base
}

export const getTechDefinitionsEUIV = () => {
  const data = sortBy<TechDataEUIV>(getTechDataEUIV(), () => 1) as ListDefinition[]
  data.forEach(level => level.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getTraditionDefinitions = () => {
  const data = toObj(sortBy<TraditionData>(getTraditionData(), value => value.name), value => value.key) as Traditions
  forEach(data, tradition => tradition.modifiers.forEach(modifier => setDefault(modifier)))
  forEach(data, tradition => tradition.paths.forEach(path => path.traditions.forEach(tradition => tradition.modifiers.forEach(modifier => setDefault(modifier)))))
  return data
}

export const getTradeDefinitions = () => {
  const data = sortBy<TradeData>(getTradeData(), value => value.name) as TradeDefinition[]
  data.forEach(entity => entity.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getHeritageDefinitions = () => {
  const data = sortBy<ListData>(getHeritageData(), value => value.name) as ListDefinition[]
  data.forEach(heritage => heritage.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getTechDefinitionsIR = () => {
  const data = sortBy<InventionData>(getTechDataIR(), () => 1) as TechDefinition[]
  data.forEach(level => level.inventions.forEach(invention => invention.modifiers.forEach(modifier => setDefault(modifier))))
  return data
}

export const getTraitDefinitions = () => {
  const data = sortBy<ListData>(getTraitData(), value => value.name) as ListDefinition[]
  data.forEach(trait => trait.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getLawDefinitions = () => {
  const data = sortBy<ListData>(getLawData(), () => 1) as ListDefinition[]
  data.forEach(trait => trait.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getPolicyDefinitions = () => {
  const data = sortBy<OptionData>(getPolicyData(), () => 1) as OptionDefinition[]
  data.forEach(option => option.forEach(option => option.modifiers.forEach(modifier => setDefault(modifier))))
  return data
}

export const getIdeaDefinitions = () => {
  const data = sortBy<ListData>(getIdeaData(), () => 1) as ListDefinition[]
  data.forEach(idea => idea.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getDeityDefinitions = () => {
  const data = sortBy<DeityData>(getDeityData(), () => 1) as DeityDefinition[]
  data.forEach(deity => deity.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getAbilityDefinitions = () => {
  const data = sortBy<OptionData>(getAbilityData(), () => 1) as OptionDefinition[]
  data.forEach(option => option.forEach(option => option.modifiers.forEach(modifier => setDefault(modifier))))
  return data
}

export const getCountryNames = () => getCountryData()


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

type DeityData = ListData & {
  isOmen: boolean
}

type OptionData = ListData[]

type DictionaryData = { [key: string]: string }
