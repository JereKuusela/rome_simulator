import { TraditionType, TraditionDefinition, TradeDefinition, TradeType } from './actions'
import { ValuesType } from '../../base_definition'
import { OrderedMap, List, fromJS, Seq } from 'immutable'

import * as traditionData from './traditions.json'
import * as tradeData from './trade.json'

export const getTraditionDefinitions = (): OrderedMap<TraditionType, TraditionDefinition> => {
  let map = OrderedMap<TraditionType, TraditionDefinition>()
  for (const value of traditionData.traditions) {
    const tradition = createTraditionFromJson(value)
    map = map.set(tradition.type, tradition)
  }
  return map.sortBy((_, key) => key)
}

export const getTradeDefinitions = (): List<TradeDefinition> => {
  let trades = List<TradeDefinition>()
  for (const value of tradeData.trade)
    trades = trades.push(createTradeFromJson(value))
  return trades.sortBy(value => value.name)
}

const createTraditionFromJson = (data: TraditionData): TraditionDefinition => {
  const paths = fromJS(data.paths, (_, sequence) => {
    if (sequence instanceof Seq.Indexed)
      return sequence.toList()
    return sequence.toObject()
  })
  return { type: data.type as TraditionType, paths }
}

const createTradeFromJson = (data: TradeData): TradeDefinition => {
  const modifier = {
    target: data.modifier.target as any,
    attribute: data.modifier.attribute,
    type: data.modifier.type as ValuesType | undefined,
    value: data.modifier.value
  }
  return { name: data.name, type: data.type as TradeType, modifier }
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
        type?: string
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
    type?: string
    value: number
  }
}
