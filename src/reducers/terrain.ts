import { getDefaultTerrains } from 'data'
import { TerrainType, Terrain } from 'types'
import * as manager from 'managers/terrains'
import { makeActionReplaceFirst, makeEntityReducer, ActionToFunction } from './utils'

const actionToFunction: ActionToFunction<Terrain> = {}

export const setTerrainImage = makeActionReplaceFirst(manager.setTerrainImage, 'setTerrainImage' as TerrainType, actionToFunction)
export const setTerrainLocation = makeActionReplaceFirst(manager.setTerrainLocation, 'setTerrainLocation' as TerrainType, actionToFunction)
export const setTerrainMode = makeActionReplaceFirst(manager.setTerrainMode, 'setTerrainMode' as TerrainType, actionToFunction)
export const setTerrainValue = makeActionReplaceFirst(manager.setTerrainValue, 'setTerrainValue' as TerrainType, actionToFunction)

export const terrainReducer = makeEntityReducer(getDefaultTerrains(), actionToFunction)
