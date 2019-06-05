import { Map } from 'immutable'
import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultGlobalDefinition } from './data'
import { setValue, setGlobalValue } from './actions'
import { UnitType, UnitDefinition, ArmyName } from './types'
import { add_value } from '../../base_definition'

export const unitsState = Map<ArmyName, Map<UnitType, UnitDefinition>>().set(ArmyName.Attacker, getDefaultDefinitions()).set(ArmyName.Defender, getDefaultDefinitions())
export const globalStatsState = Map<ArmyName, UnitDefinition>().set(ArmyName.Attacker, getDefaultGlobalDefinition()).set(ArmyName.Defender, getDefaultGlobalDefinition())

export const unitsReducer = createReducer(unitsState)
  .handleAction(setValue, (state, action: ReturnType<typeof setValue>) => (
    state.updateIn([action.payload.army, action.payload.unit], (unit: UnitDefinition) => (
      add_value(unit, action.payload.type, action.payload.key, action.payload.attribute, action.payload.value)
    ))
  ))

export const globalStatsReducer = createReducer(globalStatsState)
  .handleAction(setGlobalValue, (state, action: ReturnType<typeof setGlobalValue>) => (
    state.update(action.payload.army, unit => add_value(unit, action.payload.type, action.payload.key, action.payload.attribute, action.payload.value))
  ))
