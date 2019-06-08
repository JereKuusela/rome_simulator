import { Map, List } from 'immutable'
import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultTypes, getDefaultGlobalDefinition } from './data'
import { setValue, setGlobalValue, deleteUnit, addUnit, changeImage, changeType } from './actions'
import { UnitType, UnitDefinition, ArmyName } from './types'
import { addValue } from '../../base_definition'

export const unitsState = {
  types: Map<ArmyName, List<UnitType>>().set(ArmyName.Attacker, getDefaultTypes()).set(ArmyName.Defender, getDefaultTypes()),
  definitions: Map<ArmyName, Map<UnitType, UnitDefinition>>().set(ArmyName.Attacker, getDefaultDefinitions()).set(ArmyName.Defender, getDefaultDefinitions())
}
export const globalStatsState = Map<ArmyName, UnitDefinition>().set(ArmyName.Attacker, getDefaultGlobalDefinition()).set(ArmyName.Defender, getDefaultGlobalDefinition())

// Generic way to modify types. Same could also be used for definitions but API already has functionality.
const map = <T>(types: Map<ArmyName, List<UnitType>>, army: ArmyName, payload: T, modifier: (types: List<UnitType>, payload: T) => List<UnitType>) => {
  return types.map((value, key) => key === army ? modifier(value, payload) : value)
}

const deleter = (types: List<UnitType>, payload: { type: UnitType }) => types.delete(types.findIndex(value => value === payload.type))
const adder = (types: List<UnitType>, payload: { type: UnitType }) => types.push(payload.type)
const changer = (types: List<UnitType>, payload: { old_type: UnitType, new_type: UnitType }) => types.map(value => value === payload.old_type ? payload.new_type : value)

export const unitsReducer = createReducer(unitsState)
  .handleAction(setValue, (state, action: ReturnType<typeof setValue>) => (
    {
      ...state,
      definitions: state.definitions.updateIn([action.payload.army, action.payload.unit], (unit: UnitDefinition) => (
        addValue(unit, action.payload.type, action.payload.key, action.payload.attribute, action.payload.value)
      ))
    }
  ))
  .handleAction(deleteUnit, (state, action: ReturnType<typeof deleteUnit>) => (
    {
      ...state,
      definitions: state.definitions.deleteIn([action.payload.army, action.payload.type]),
      types: map(state.types, action.payload.army, action.payload, deleter)
    }
  ))
  .handleAction(addUnit, (state, action: ReturnType<typeof addUnit>) => (
    {
      ...state,
      definitions: state.definitions.setIn([action.payload.army, action.payload.type], { type: action.payload.type }),
      types: map(state.types, action.payload.army, action.payload, adder)
    }
  ))
  .handleAction(changeImage, (state, action: ReturnType<typeof changeImage>) => (
    {
      ...state,
      definitions: state.definitions.updateIn([action.payload.army, action.payload.type], unit => ({ ...unit, image: action.payload.image }))
    }
  ))
  .handleAction(changeType, (state, action: ReturnType<typeof changeType>) => (
    {
      ...state,
      definitions: state.definitions.setIn([action.payload.army, action.payload.new_type], { ...state.definitions.getIn([action.payload.army, action.payload.old_type]), type: action.payload.new_type }).deleteIn([action.payload.army, action.payload.old_type]),
      types: map(state.types, action.payload.army, action.payload, changer)
    }
  ))

export const globalStatsReducer = createReducer(globalStatsState)
  .handleAction(setGlobalValue, (state, action: ReturnType<typeof setGlobalValue>) => (
    state.update(action.payload.army, unit => addValue(unit, action.payload.type, action.payload.key, action.payload.attribute, action.payload.value))
  ))
