import { sortBy } from 'lodash'
import { toObj, map, forEach } from 'utils'
import {
  ValuesType, CultureType, ReligionType, LawDefinition, EconomyDefinition, IdeaDefinition, AbilityDefinition,
  TraditionDefinition, TradeDefinition, HeritageDefinition, InventionDefinition, OmenDefinition, TraitDefinition, Modifier, ScopeType
} from 'types'

import * as traditionData from './json/ir/traditions.json'
import * as tradeData from './json/ir/trades.json'
import * as heritageData from './json/ir/heritages.json'
import * as inventionData from './json/ir/inventions.json'
import * as omenData from './json/ir/omens.json'
import * as traitData from './json/ir/traits.json'
import * as lawData from './json/ir/laws.json'
import * as economyData from './json/ir/economy.json'
import * as ideaData from './json/ir/ideas.json'
import * as abilityData from './json/ir/abilities.json'

type Traditions = { [key in CultureType]: TraditionDefinition }
type Omens = { [key in ReligionType]: OmenDefinition[] }

const setDefault = (modifier: Modifier, scope: ScopeType = ScopeType.Country) => {
  modifier.scope = modifier.scope ?? scope
  modifier.type = modifier.type ?? ValuesType.Base
}

export const getTraditionDefinitions = () => {
  const data = toObj(sortBy<TraditionData>(Array.from(traditionData.traditions), value => value.type), value => value.type) as Traditions
  forEach(data, tradition => tradition.modifiers.forEach(modifier => setDefault(modifier)))
  forEach(data, tradition => tradition.paths.forEach(path => path.traditions.forEach(tradition => tradition.modifiers.forEach(modifier => setDefault(modifier)))))
  return data
}

export const getTradeDefinitions = () => {
  const data = sortBy<TradeData>(Array.from(tradeData.trades), value => value.name) as TradeDefinition[]
  data.forEach(trade => setDefault(trade.modifier))
  return data
}

export const getHeritageDefinitions = () => {
  const data = sortBy<HeritageData>(Array.from(heritageData.heritages), value => value.name) as HeritageDefinition[]
  data.forEach(heritage => heritage.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getInventionDefinitions = () => {
  const data = sortBy<InventionData>(Array.from(inventionData.levels), () => 1) as InventionDefinition[]
  data.forEach(level => level.inventions.forEach(invention => invention.forEach(modifier => setDefault(modifier))))
  return data
}

export const getOmenDefinitions = () => {
  const data = map(toObj(sortBy<OmenData>(Array.from(omenData.religions), value => value.type), value => value.type), value => value.omens) as Omens
  forEach(data, omens => omens.forEach(omen => setDefault(omen.modifier)))
  return data
}

export const getTraitDefinitions = () => {
  const data = sortBy<TraitData>(Array.from(traitData.traits), value => value.name) as TraitDefinition[]
  data.forEach(trait => trait.modifiers.forEach(modifier => setDefault(modifier, ScopeType.Army)))
  return data
}

export const getLawDefinitions = () => {
  const data = sortBy<LawData>(Array.from(lawData.laws), () => 1) as LawDefinition[]
  data.forEach(law => law.options.forEach(option => option.modifiers.forEach(modifier => setDefault(modifier))))
  return data
}

export const getEconomyDefinitions = () => {
  const data = sortBy<EconomyData>(Array.from(economyData.economy), () => 1) as EconomyDefinition[]
  data.forEach(economy => economy.options.forEach(option => option.modifiers.forEach(modifier => setDefault(modifier))))
  return data
}

export const getIdeaDefinitions = () => {
  const data = sortBy<IdeaData>(Array.from(ideaData.ideas), () => 1) as IdeaDefinition[]
  data.forEach(idea => idea.modifiers.forEach(modifier => setDefault(modifier)))
  return data
}

export const getAbilityDefinitions = () => {
  const data = sortBy<AbilityData>(Array.from(abilityData.abilities), () => 1) as AbilityDefinition[]
  data.forEach(ability => ability.options.forEach(option => option.modifiers.forEach(modifier => setDefault(modifier, ScopeType.Army))))
  return data
}

interface ModifierData {
  target: string
  attribute: string
  value: number
}

interface TraditionData {
  type: string
  modifiers: ModifierData[]
  paths: {
    name: string
    traditions: {
      name: string
      modifiers: ModifierData[]
    }[]
  }[]
}

interface TradeData {
  name: string
  type: string
  modifier: ModifierData
}

interface HeritageData {
  name: string
  modifiers: ModifierData[]
}

interface InventionData {
  name: string
  inventions: ModifierData[][]
}

interface OmenData {
  type: string
  omens: {
    name: string
    modifier: ModifierData
  }[]
}

interface TraitData {
  name: string,
  modifiers: ModifierData[]
}

interface LawData {
  name: string,
  options: {
    name: string,
    modifiers: ModifierData[]
  }[]
}

interface EconomyData {
  name: string,
  options: {
    name: string,
    modifiers: ModifierData[]
  }[]
}

interface IdeaData {
  name: string,
  modifiers: ModifierData[]
}

interface AbilityData {
  name: string,
  options: {
    name: string,
    modifiers: ModifierData[]
  }[]
}