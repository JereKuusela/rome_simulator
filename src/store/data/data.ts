
import { OrderedMap, List } from 'immutable'
import { sortBy } from 'lodash'
import { listFromJS, toObj, map } from '../../utils'
import {
  CultureType, ReligionType, LawDefinition, EconomyDefinition, IdeaDefinition, AbilityDefinition,
  TraditionDefinition, TradeDefinition, HeritageDefinition, InventionDefinition, OmenDefinition, TraitDefinition
} from './types'

import * as traditionData from './traditions.json'
import * as tradeData from './trades.json'
import * as heritageData from './heritages.json'
import * as inventionData from './inventions.json'
import * as omenData from './omens.json'
import * as traitData from './traits.json'
import * as lawData from './laws.json'
import * as economyData from './economy.json'
import * as ideaData from './ideas.json'
import * as abilityData from './abilities.json'

type Traditions = { [key in CultureType]: TraditionDefinition }
type Omens = { [key in ReligionType]: OmenDefinition[] }

export const getTraditionDefinitions = () => (
  toObj(sortBy<TraditionData>(traditionData.traditions, value => value.type), value => value.type) as Traditions
)

export const getTradeDefinitions = () => (
  sortBy<TradeData>(tradeData.trades, value => value.name) as TradeDefinition[]
)

export const getHeritageDefinitions = () => (
  sortBy<HeritageData>(heritageData.heritages, value => value.name) as HeritageDefinition[]
)

export const getInventionDefinitions = () => (
  sortBy<InventionData>(inventionData.levels, () => 1) as InventionDefinition[]
)

export const getOmenDefinitions = () => (
  map(toObj(sortBy<OmenData>(omenData.religions, value => value.type), value => value.type), value => value.omens) as Omens
)

export const getTraitDefinitions = () => (
  sortBy<TraitData>(traitData.traits, value => value.name) as TraitDefinition[]
)

export const getLawDefinitions = () => (
  sortBy<LawData>(lawData.laws, () => 1) as LawDefinition[]
)

export const getEconomyDefinitions = () => (
  sortBy<EconomyData>(economyData.economy, () => 1) as EconomyDefinition[]
)

export const getIdeaDefinitions = () => (
  sortBy<IdeaData>(ideaData.ideas, () => 1) as IdeaDefinition[]
)

export const getAbilityDefinitions = () => (
  sortBy<AbilityData>(abilityData.abilities, () => 1) as AbilityDefinition[]
)

interface ModifierData {
  target: string
        attribute: string
        value: number
}

interface TraditionData {
  type: string
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