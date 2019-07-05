import { TraditionType, TraditionDefinition, TradeDefinition, HeritageDefinition, InventionDefinition } from './actions'
import { OrderedMap, List } from 'immutable'
import { listFromJS } from '../../utils'

import * as traditionData from './traditions.json'
import * as tradeData from './trades.json'
import * as heritageData from './heritages.json'
import * as inventionData from './inventions.json'

export const getTraditionDefinitions = (): OrderedMap<TraditionType, TraditionDefinition> => {
  let map = OrderedMap<TraditionType, TraditionDefinition>()
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
    negative?: boolean
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
