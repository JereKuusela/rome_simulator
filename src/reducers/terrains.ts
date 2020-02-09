import { getDefaultTerrainState } from 'data'
import { Terrains, Terrain, TerrainType } from 'types'
import * as manager from 'managers/terrains'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction, makeActionReplaceFirst, makeEntityReducer } from './utils'

const terrainsMapping: ActionToFunction<Terrains> = {}

export const createTerrain = makeActionRemoveFirst(manager.createTerrain, terrainsMapping)
export const setTerrainType = makeActionRemoveFirst(manager.setTerrainType, terrainsMapping)
export const deleteTerrain = makeActionRemoveFirst(manager.deleteTerrain, terrainsMapping)

export const terrainsReducer = makeContainerReducer(getDefaultTerrainState(), terrainsMapping)

const terrainMapping: ActionToFunction<Terrain, TerrainType> = {}

export const setTerrainImage = makeActionReplaceFirst(manager.setTerrainImage, terrainMapping)
export const setTerrainLocation = makeActionReplaceFirst(manager.setTerrainLocation, terrainMapping)
export const setTerrainMode = makeActionReplaceFirst(manager.setTerrainMode, terrainMapping)
export const setTerrainValue = makeActionReplaceFirst(manager.setTerrainValue, terrainMapping)

export const terrainReducer = makeEntityReducer(getDefaultTerrainState(), terrainMapping)
