import { filterTerrains } from 'managers/terrains'
import createCachedSelector from 're-reselect'
import type { AppState } from 'reducers'
import { LocationType } from 'types'
import { toArr } from 'utils'
import { useSelector } from './utils'

export const getTerrainsData = (state: AppState) => state.terrains
const getProp = (_: unknown, prop: LocationType | undefined) => prop ?? ''

// Terrains are cached because they rarely change and filtering would always return a new instance.

export const getTerrainsDict = createCachedSelector([getTerrainsData, getProp], (terrains, location) =>
  location ? filterTerrains(terrains, location) : terrains
)(getProp)

export const getTerrainsArray = createCachedSelector([getTerrainsDict], terrains => toArr(terrains))(getProp)

export const getTerrainTypes = createCachedSelector([getTerrainsArray], terrains => terrains.map(item => item.type))(
  getProp
)

export const useTerrainsDict = (location?: LocationType) => useSelector(state => getTerrainsDict(state, location))

export const useTerrainsArray = (location?: LocationType) => useSelector(state => getTerrainsArray(state, location))
