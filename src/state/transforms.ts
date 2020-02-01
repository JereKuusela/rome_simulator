import produce from 'immer'
import { getDefaultTactic, getDefaultTerrain, getDefaultUnit } from 'data'
import { map, forEach } from 'utils'
import { mergeValues, clearAllValues } from 'definition_values'
import { getNextId } from 'army_utils'
import { ModeState, TacticDefinitions, TerrainDefinitions, UnitState } from 'types'



export const restoreBaseTactics = (state: TacticDefinitions): TacticDefinitions => map(state, (tactic, type) => mergeValues(clearAllValues(tactic, type), getDefaultTactic(type)))
export const restoreBaseTerrains = (state: TerrainDefinitions): TerrainDefinitions => map(state, (terrain, type) => mergeValues(clearAllValues(terrain, type), getDefaultTerrain(type)))
export const restoreBaseUnits = (state: UnitState): UnitState => map(state, definitions => map(definitions, (unit, type) => mergeValues(clearAllValues(unit, type), getDefaultUnit(type))))

export const stripRounds = (battle: ModeState): ModeState => map(battle, value => ({ ...value, outdated: true, participants: map(value.participants, value => ({ ...value, rounds: [] })) }))

export const setIds = (battle: ModeState): ModeState => {
  return produce(battle, battle => {
    forEach(battle, mode => forEach(mode.armies, army => {
      army.frontline.forEach(unit => unit ? unit.id = getNextId() : {})
      army.reserve.forEach(unit => unit.id = getNextId())
      army.defeated.forEach(unit => unit.id = getNextId())
    }))
  })
}
