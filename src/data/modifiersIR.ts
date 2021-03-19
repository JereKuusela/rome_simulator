import { groupBy } from 'lodash'
import { ListDefinitions, DeityDefinitions, DictionaryData, ListDefinition2 } from 'types'

import traditionData from './json/ir/traditions.json'
import tradeData from './json/ir/trades.json'
import heritageData from './json/ir/heritages.json'
import cultureData from './json/ir/cultures.json'
import inventionData from './json/ir/inventions.json'
import traitData from './json/ir/traits.json'
import lawData from './json/ir/laws.json'
import policyData from './json/ir/policies.json'
import ideaData from './json/ir/ideas.json'
import abilityData from './json/ir/abilities.json'
import countryData from './json/ir/countries.json'
import territoryData from './json/ir/territories.json'
import deityData from './json/ir/deities.json'
import religionData from './json/ir/religions.json'
import factionData from './json/ir/parties.json'
import effectData from './json/ir/effects.json'
import distinctionData from './json/ir/distinctions.json'
import { toObj } from 'utils'

type Key = string | number
type Get<S, T> = S extends Key[] ? T[] : T

const buildData = <T extends ListDefinition2>(data: unknown[]) => {
  const byIndex = Array.from(data) as T[]
  const byIndexFiltered = byIndex.filter(item => item.relevant)
  const byKey = toObj(byIndex, item => item.key)
  const byKeyFiltered = toObj(byIndexFiltered, item => item.key)
  const byParent = groupBy(byIndex, item => item.parent)
  const byParentFiltered = groupBy(byIndexFiltered, item => item.parent)
  const siblings = (key: string) => byParent[byKey[key].parent ?? '']
  const siblingKeys = (key: string) => siblings(key).map(item => item.key)
  const getOne = (key: Key) => (typeof key === 'string' ? byKey[key] : byIndex[key])
  const get = <S = Key | string[] | number[]>(key: S): Get<S, T> => {
    if (Array.isArray(key)) return (key as Key[]).map(getOne).filter(item => item) as Get<S, T>
    return getOne(key as never) as Get<S, T>
  }

  return [
    {
      byIndex: byIndex,
      byKey: (filter = false) => (filter ? byKeyFiltered : byKey),
      byParent: (filter = false) => (filter ? byParentFiltered : byParent),
      siblings,
      siblingKeys,
      get
    },
    byIndex,
    byIndexFiltered
  ] as const
}

export const abilitiesIR = buildData(process.env.REACT_APP_GAME === 'IR' ? abilityData : [])[0]
export const policiesIR = buildData(process.env.REACT_APP_GAME === 'IR' ? policyData : [])[0]
export const lawsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? lawData : [])[0]
export const traditionsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? traditionData : [])[0]
export const distinctionsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? distinctionData : [])[0]
export const ideasIR = buildData(process.env.REACT_APP_GAME === 'IR' ? ideaData : [])[0]
export const traitsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? traitData : [])[0]
export const inventionsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? inventionData : [])[0]

export const heritagesIR = process.env.REACT_APP_GAME === 'IR' ? (heritageData as ListDefinitions) : {}
export const tradesIR = process.env.REACT_APP_GAME === 'IR' ? (tradeData as ListDefinitions) : {}
export const deitiesIR = process.env.REACT_APP_GAME === 'IR' ? (deityData as DeityDefinitions) : {}
export const countriesIR = process.env.REACT_APP_GAME === 'IR' ? countryData : ({} as DictionaryData)
export const territoriesIR = process.env.REACT_APP_GAME === 'IR' ? territoryData : ({} as DictionaryData)
export const religionsIR = process.env.REACT_APP_GAME === 'IR' ? (religionData as ListDefinitions) : {}
export const factionsIR = process.env.REACT_APP_GAME === 'IR' ? (factionData as ListDefinitions) : {}
export const effectsIR = process.env.REACT_APP_GAME === 'IR' ? (effectData as ListDefinitions) : {}
export const culturesIR = process.env.REACT_APP_GAME === 'IR' ? cultureData : ({} as DictionaryData)
