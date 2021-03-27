import { groupBy } from 'lodash'
import { DeityDefinition, DictionaryData, DataEntry, CultureData, RegionData, Modifier } from 'types'

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
import regionData from './json/ir/regions.json'
import { toObj } from 'utils'

type Key = string | number
type Get<S, T> = S extends Key[] ? T[] : T
type GetName<S> = S extends Key[] ? string[] : string

const buildData = <T extends DataEntry>(data: unknown[]) => {
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
  const getName = <S = Key | string[] | number[]>(key: S): GetName<S> => {
    const items = get(key)
    if (Array.isArray(items)) return items.map(item => item.name) as GetName<S>
    return ((items as T)?.name ?? '') as GetName<S>
  }
  const getModifiers = <S = Key | string[] | number[]>(key: S): Modifier[] => {
    const items = get(key)
    if (Array.isArray(items)) return items.map(item => item.modifiers).flat()
    return (items as T)?.modifiers ?? []
  }
  return {
    byIndex: (filter = false) => (filter ? byIndexFiltered : byIndex),
    byKey: (filter = false) => (filter ? byKeyFiltered : byKey),
    byParent: (filter = false) => (filter ? byParentFiltered : byParent),
    siblings,
    siblingKeys,
    get,
    getName,
    getModifiers
  }
}

export const abilitiesIR = buildData(process.env.REACT_APP_GAME === 'IR' ? abilityData : [])
export const policiesIR = buildData(process.env.REACT_APP_GAME === 'IR' ? policyData : [])
export const lawsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? lawData : [])
export const traditionsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? traditionData : [])
export const distinctionsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? distinctionData : [])
export const ideasIR = buildData(process.env.REACT_APP_GAME === 'IR' ? ideaData : [])
export const traitsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? traitData : [])
export const inventionsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? inventionData : [])
export const heritagesIR = buildData(process.env.REACT_APP_GAME === 'IR' ? heritageData : [])
export const tradesIR = buildData(process.env.REACT_APP_GAME === 'IR' ? tradeData : [])
export const deitiesIR = buildData<DeityDefinition>(process.env.REACT_APP_GAME === 'IR' ? deityData : [])
export const factionsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? factionData : [])
export const religionsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? religionData : [])
export const effectsIR = buildData(process.env.REACT_APP_GAME === 'IR' ? effectData : [])

export const countriesIR = process.env.REACT_APP_GAME === 'IR' ? countryData : ({} as DictionaryData)
export const territoriesIR = process.env.REACT_APP_GAME === 'IR' ? territoryData : ({} as DictionaryData)
export const culturesIR = process.env.REACT_APP_GAME === 'IR' ? cultureData : ({} as CultureData)
export const regionsIR = process.env.REACT_APP_GAME === 'IR' ? regionData : ({} as RegionData)
