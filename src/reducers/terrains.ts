import { getDefaultTerrains } from 'data'
import { produce } from 'immer'
import { TerrainType, Terrains, Terrain } from 'types'
import * as manager from 'managers/terrains'
import { Prepend } from 'typescript-tuple/lib/utils'

const actionToFunction: { [key: string]: (terrain: Terrain, ...args: any) => void | undefined } = {}
const actionsToFunction: { [key: string]: (terrains: Terrains, ...args: any) => void | undefined } = {}


const makeTerrainsAction = <T extends any[], S extends string>(func: (terrains: Terrains, ...args: T) => any, type: S) => {
  const ret = (...args: T) => ({
    type,
    payload: args as T
  })
  actionsToFunction[type] = func
  return ret
}


export const addTerrain = makeTerrainsAction(manager.addTerrain, 'addTerrain')
export const setTerrainType = makeTerrainsAction(manager.setTerrainType, 'setTerrainType')
export const deleteTerrain = makeTerrainsAction(manager.deleteTerrain, 'deleteTerrain')

export const terrainsReducer = (state = getDefaultTerrains(), action: Action) => {
  const func = actionsToFunction[action.type]
  if (!func)
    return state
  return produce(state, draft => {
    func(draft, ...action.payload)
  })
}

const makeTerrainAction = <T extends any[], S extends string>(func: (terrain: Terrain, ...args: T) => any, type: S) => {
  const ret = (terrain: TerrainType, ...args: T) => ({
    type,
    payload: [terrain, ...args] as any as  Prepend<T, TerrainType>
  })
  actionToFunction[type] = func
  ret['type'] = type
  return ret
}

export const setTerrainImage = makeTerrainAction(manager.setTerrainImage, 'setTerrainImage')
export const setTerrainLocation = makeTerrainAction(manager.setTerrainLocation, 'setTerrainLocation')
export const setTerrainMode = makeTerrainAction(manager.setTerrainMode, 'setTerrainMode')
export const setTerrainValue = makeTerrainAction(manager.setTerrainValue, 'setTerrainValue')

export const terrainReducer = (state = getDefaultTerrains(), action: Action) => {
  const func = actionToFunction[action.type]
  if (!func)
    return state
  return produce(state, draft => {
    const [terrain, ...payload] = action.payload
    func(draft[terrain], ...payload)
  })
}

type Action = {
  type: string,
  payload: [TerrainType, ...any[]]
}

