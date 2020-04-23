import { sortBy } from 'lodash'
import { toObj, map, forEach } from 'utils'
import {
  ValuesType, CultureType, ReligionType, LawDefinition, EconomyDefinition, IdeaDefinition, AbilityDefinition,
  TraditionDefinition, TradeDefinition, HeritageDefinition, InventionDefinition, OmenDefinition, TraitDefinition, Modifier, TechDefinitionEUIV
} from 'types'

import * as traditionData from './json/ir/traditions.json'
import * as tradeData from './json/ir/trades.json'
import * as heritageData from './json/ir/heritages.json'
import * as techDataIR from './json/ir/tech.json'
import * as omenData from './json/ir/omens.json'
import * as traitData from './json/ir/traits.json'
import * as lawData from './json/ir/laws.json'
import * as economyData from './json/ir/economy.json'
import * as ideaData from './json/ir/ideas.json'
import * as abilityData from './json/ir/abilities.json'

import * as techDataEUIV from './json/euiv/tech.json'

// Bit ugly but these enable tree shaking based on the game.
const getTechDataEUIV = () => process.env.REACT_APP_GAME === 'euiv' ? Array.from(techDataEUIV.tech) : [] as TechDataEUIV[]
const getTraditionData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(traditionData.traditions) : [] as TraditionData[]
const getTradeData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(tradeData.trades) : [] as TradeData[]
const getHeritageData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(heritageData.heritages) : [] as HeritageData[]
const getTechDataIR = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(techDataIR.tech) : [] as InventionData[]
const getOmenData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(omenData.religions) : [] as OmenData[]
const getTraitData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(traitData.traits) : [] as TraitData[]
const getLawData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(lawData.laws) : [] as LawData[]
const getEconomyData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(economyData.economy) : [] as EconomyData[]
const getIdeaData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(ideaData.ideas) : [] as IdeaData[]
const getAbilityData = () => process.env.REACT_APP_GAME === 'ir' ? Array.from(abilityData.abilities) : [] as AbilityData[]

export type Traditions = { [key in CultureType ]: TraditionDefinition }
type Omens = { [key in ReligionType]: OmenDefinition[] }

const setDefault = (modifier: Modifier) => {
  modifier.type = modifier.type ?? ValuesType.Base
}

export const getTechDefinitionsEUIV = () => {
  const data = sortBy<TechDataEUIV>(getTechDataEUIV(), () => 1) as TechDefinitionEUIV[]
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
  data.forEach(trade => setDefault(trade.modifier))
  return data
}

export const getHeritageDefinitions = () => {
  const data = sortBy<HeritageData>(getHeritageData(), value => value.name) as HeritageDefinition[]
  data.forEach(heritage => heritage.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getTechDefinitionsIR = () => {
  const data = sortBy<InventionData>(getTechDataIR(), () => 1) as InventionDefinition[]
  data.forEach(level => level.inventions.forEach(invention => invention.modifiers.forEach(modifier => setDefault(modifier))))
  return data
}

export const getOmenDefinitions = () => {
  const data = map(toObj(sortBy<OmenData>(getOmenData(), value => value.type), value => value.type), value => value.omens) as Omens
  forEach(data, omens => omens.forEach(omen => setDefault(omen.modifier)))
  return data
}

export const getTraitDefinitions = () => {
  const data = sortBy<TraitData>(getTraitData(), value => value.name) as TraitDefinition[]
  data.forEach(trait => trait.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getLawDefinitions = () => {
  const data = sortBy<LawData>(getLawData(), () => 1) as LawDefinition[]
  data.forEach(law => law.options.forEach(option => option.modifiers.forEach(modifier => setDefault(modifier))))
  return data
}

export const getEconomyDefinitions = () => {
  const data = sortBy<EconomyData>(getEconomyData(), () => 1) as EconomyDefinition[]
  data.forEach(economy => economy.options.forEach(option => option.modifiers.forEach(modifier => setDefault(modifier))))
  return data
}

export const getIdeaDefinitions = () => {
  const data = sortBy<IdeaData>(getIdeaData(), () => 1) as IdeaDefinition[]
  data.forEach(idea => idea.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getAbilityDefinitions = () => {
  const data = sortBy<AbilityData>(getAbilityData(), () => 1) as AbilityDefinition[]
  data.forEach(ability => ability.options.forEach(option => option.modifiers.forEach(modifier => setDefault(modifier))))
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
  name: string
  type: string
  modifier: ModifierData
}

interface TechDataEUIV {
  name: string
  modifiers: ModifierData[]
}

interface HeritageData {
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

interface TraitData {
  name: string
  modifiers: ModifierData[]
}

interface LawData {
  name: string
  options: {
    name: string
    modifiers: ModifierData[]
  }[]
}

interface EconomyData {
  name: string
  options: {
    name: string
    modifiers: ModifierData[]
  }[]
}

interface IdeaData {
  name: string
  modifiers: ModifierData[]
}

interface AbilityData {
  name: string,
  options: {
    name: string
    modifiers: ModifierData[]
  }[]
}