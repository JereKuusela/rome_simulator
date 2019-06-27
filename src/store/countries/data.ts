import { TraditionType, TraditionDefinition, Path } from './actions'
import { Map, OrderedSet, List, fromJS, Seq } from 'immutable'

import * as data from './traditions.json'

export const getDefaultDefinitions = (): Map<TraditionType, TraditionDefinition> => {
  let map = Map<TraditionType, TraditionDefinition>()
  for (const value of data.traditions) {
    const tradition = createTraditionFromJson(value)
    map = map.set(tradition.type, tradition)
  }
  return map
}

export const getDefaultTypes = (): OrderedSet<TraditionType> => {
  const traditions = Object.keys(TraditionType).map(k => TraditionType[k as any]) as TraditionType[]
  return OrderedSet<TraditionType>(traditions)
}

export const traditionFromJS = (object: Map<string, any>): TraditionDefinition | undefined => {
  if (!object)
    return undefined
  const type = object.get('type') as TraditionType
  return { type, paths: List<Path>()}
}

const createTraditionFromJson = (data: TraditionData): TraditionDefinition => {
  const paths = fromJS(data.paths, (_, sequence) => {
    if (sequence instanceof Seq.Indexed)
      return sequence.toList()
    return sequence.toObject()
  })
  let tradition: TraditionDefinition = { type: data.type as TraditionType, paths }
  return tradition
}

interface TraditionData {
  type: string
  paths: {
    name: string
    traditions: {
      name: string
      modifiers: {
        type: string
        attribute: string
        value: number
      }[]
    }[]
  }[]
}
