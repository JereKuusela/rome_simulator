import { getDefaultTerrains } from 'data'
import { Terrains } from 'types'
import * as manager from 'managers/terrains'
import { makeActionRemoveFirst, makeContainerReducer, ActionToFunction } from './utils'

const actionToFunction: ActionToFunction<Terrains> = {}

export const addTerrain = makeActionRemoveFirst(manager.addTerrain, 'addTerrain', actionToFunction)
export const setTerrainType = makeActionRemoveFirst(manager.setTerrainType, 'setTerrainType', actionToFunction)
export const deleteTerrain = makeActionRemoveFirst(manager.deleteTerrain, 'deleteTerrain', actionToFunction)

export const terrainsReducer = makeContainerReducer(getDefaultTerrains(), actionToFunction)
