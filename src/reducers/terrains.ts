import { getDefaultTerrainState } from 'data'
import { TerrainsData, TerrainData, TerrainType } from 'types'
import * as manager from 'managers/terrains'
import {
  makeActionRemoveFirst,
  makeContainerReducer,
  ActionToFunction,
  compose,
  makeActionReplaceFirst,
  makeEntityReducer
} from './utils'

const terrainsMapping: ActionToFunction<TerrainsData> = {}

export const createTerrain = makeActionRemoveFirst(manager.createTerrain, terrainsMapping)
export const setTerrainType = makeActionRemoveFirst(manager.setTerrainType, terrainsMapping)
export const deleteTerrain = makeActionRemoveFirst(manager.deleteTerrain, terrainsMapping)

const terrains = makeContainerReducer(getDefaultTerrainState(), terrainsMapping)

const terrainMapping: ActionToFunction<TerrainData, TerrainType> = {}

export const setTerrainImage = makeActionReplaceFirst(manager.setTerrainImage, terrainMapping)
export const setTerrainLocation = makeActionReplaceFirst(manager.setTerrainLocation, terrainMapping)
export const setTerrainValue = makeActionReplaceFirst(manager.setTerrainValue, terrainMapping)

const terrain = makeEntityReducer(getDefaultTerrainState(), terrainMapping)

export const terrainsReducer = compose(terrain, terrains)
