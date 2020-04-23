import { sortBy } from 'lodash'
import { toObj, map, forEach } from 'utils'
import {
  ValuesType, CultureType, ReligionType, ListDefinition, OptionDefinition,
  TraditionDefinition, TradeDefinition, OmenDefinition, Modifier, TechDefinition
} from 'types'

import * as traditionData from './json/ir/traditions.json'
import * as tradeData from './json/ir/trades.json'
import * as heritageData from './json/ir/heritages.json'
import * as techDataIR from './json/ir/tech.json'
import * as omenData from './json/ir/omens.json'
import * as traitData from './json/ir/traits.json'
import * as lawData from './json/ir/laws.json'
import * as policyData from './json/ir/policies.json'
import * as ideaData from './json/ir/ideas.json'
import * as abilityData from './json/ir/abilities.json'

import * as techDataEUIV from './json/euiv/tech.json'

// Bit ugly but these enable tree shaking based on the game.
const getTechDataEUIV = () => process.env.REACT_APP_GAME === 'euiv' ? Array.from(techDataEUIV.tech) : [] as TechDataEUIV[]
const getTraditionData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(traditionData.traditions) : [] as TraditionData[]
const getTradeData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(tradeData.trades) : [] as TradeData[]
const getHeritageData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(heritageData.heritages) : [] as ListData[]
const getTechDataIR = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(techDataIR.tech) : [] as InventionData[]
const getOmenData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(omenData.religions) : [] as OmenData[]
const getTraitData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(traitData.traits) : [] as ListData[]
const getLawData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(lawData.laws) : [] as ListData[]
const getPolicyData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(policyData.policies) : [] as OptionData[]
const getIdeaData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(ideaData.ideas) : [] as ListData[]
const getAbilityData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(abilityData.abilities) : [] as OptionData[]

export type Traditions = { [key in CultureType ]: TraditionDefinition }
type Omens = { [key in ReligionType]: OmenDefinition[] }

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

export const getOmenDefinitions = () => {
  const data = map(toObj(sortBy<OmenData>(getOmenData(), value => value.type), value => value.type), value => value.omens) as Omens
  forEach(data, omens => omens.forEach(omen => setDefault(omen.modifier)))
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

export const getAbilityDefinitions = () => {
  const data = sortBy<OptionData>(getAbilityData(), () => 1) as OptionDefinition[]
  data.forEach(option => option.forEach(option => option.modifiers.forEach(modifier => setDefault(modifier))))
  return data
}

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

interface OmenData {
  type: string
  omens: {
    name: string
    modifier: ModifierData
  }[]
}

type ListData = {
  name: string
  key: string
  modifiers: ModifierData[]
}

type OptionData = ListData[]
