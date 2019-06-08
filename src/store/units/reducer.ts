import { Map, List } from 'immutable'
import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultGlobalDefinition } from './data'
import { setValue, setGlobalValue } from './actions'
import { UnitType, UnitDefinition, ArmyName } from './types'
import { addValue } from '../../base_definition'

export const unitsState = {
  types: List<UnitType>(),
  definitions: Map<ArmyName, Map<UnitType, UnitDefinition>>().set(ArmyName.Attacker, getDefaultDefinitions()).set(ArmyName.Defender, getDefaultDefinitions())
}
export const globalStatsState = Map<ArmyName, UnitDefinition>().set(ArmyName.Attacker, getDefaultGlobalDefinition()).set(ArmyName.Defender, getDefaultGlobalDefinition())

export const unitsReducer = createReducer(unitsState)
  .handleAction(setValue, (state, action: ReturnType<typeof setValue>) => (
    {
      ...state,
      definitions: state.definitions.updateIn([action.payload.army, action.payload.unit], (unit: UnitDefinition) => (
        addValue(unit, action.payload.type, action.payload.key, action.payload.attribute, action.payload.value)
      ))
    }
  ))

export const globalStatsReducer = createReducer(globalStatsState)
  .handleAction(setGlobalValue, (state, action: ReturnType<typeof setGlobalValue>) => (
    state.update(action.payload.army, unit => addValue(unit, action.payload.type, action.payload.key, action.payload.attribute, action.payload.value))
  ))
