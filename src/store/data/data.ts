
import { OrderedMap, List } from 'immutable'
import { listFromJS } from '../../utils'
import {
  CultureType, ReligionType,
  TraditionDefinition, TradeDefinition, HeritageDefinition, InventionDefinition, OmenDefinition, TraitDefinition
} from './types'

import * as traditionData from './traditions.json'
import * as tradeData from './trades.json'
import * as heritageData from './heritages.json'
import * as inventionData from './inventions.json'
import * as omenData from './omens.json'
import * as traitData from './traits.json'

export const getTraditionDefinitions = (): OrderedMap<CultureType, TraditionDefinition> => {
  let map = OrderedMap<CultureType, TraditionDefinition>()
  for (const value of traditionData.traditions) {
    const tradition = listFromJS<TraditionData>(value)
    map = map.set(tradition.type, tradition)
  }
  return map.sortBy((_, key) => key)
}

export const getTradeDefinitions = (): List<TradeDefinition> => {
  let trades = List<TradeDefinition>()
  for (const value of tradeData.trades)
    trades = trades.push(listFromJS<TradeData>(value))
  return trades.sortBy(value => value.name)
}

export const getHeritageDefinitions = (): List<HeritageDefinition> => {
  let heritages = List<HeritageDefinition>()
  for (const value of heritageData.heritages)
    heritages = heritages.push(listFromJS<HeritageData>(value))
  return heritages.sortBy(value => value.name)
}

export const getInventionDefinitions = (): List<InventionDefinition> => {
  let inventions = List<InventionDefinition>()
  for (const value of inventionData.levels)
    inventions = inventions.push(listFromJS<InventionData>(value))
  return inventions
}

export const getOmenDefinitions = (): OrderedMap<ReligionType, List<OmenDefinition>> => {
  let omens = OrderedMap<ReligionType, List<OmenDefinition>>()
  for (const value of omenData.religions) {
    const religion = listFromJS<OmenData>(value)
    omens = omens.set(religion.type, religion.omens)
  }
  return omens.sortBy((_, key) => key)
}

export const getTraitDefinitions = (): List<TraitDefinition> => {
  let traits = List<TraitDefinition>()
  for (const value of traitData.traits)
    traits = traits.push(listFromJS<TraitData>(value))
  return traits.sortBy((_, key) => key)
}

interface TraditionData {
  type: string
  paths: {
    name: string
    traditions: {
      name: string
      modifiers: {
        target: string
        attribute: string
        value: number
      }[]
    }[]
  }[]
}

interface TradeData {
  name: string
  type: string
  modifier: {
    target: string
    attribute: string
    value: number
  }
}

interface HeritageData {
  name: string
  modifiers: {
    target: string
    attribute: string
    value: number
  }[]
}

interface InventionData {
  name: string
  inventions: {
    target: string
    attribute: string
    value: number
  }[][]
}

interface OmenData {
  type: string
  omens: {
    name: string
    modifier: {
      target: string
      attribute: string
      value: number
    }
  }[]
}

interface TraitData {
  name: string,
  modifiers: {
    target: string
    attribute: string
    value: number
  }[]
}
