import { Map, OrderedSet } from 'immutable'
import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultTypes, getDefaultGlobalDefinition } from './data'
import { 
  UnitType, UnitDefinition, ArmyName,
  setValue, setGlobalValue, deleteUnit, addUnit, changeImage, changeType, deleteArmy, createArmy, changeName, duplicateArmy
} from './actions'
import { addValues } from '../../base_definition'

export const unitsState = {
  types: Map<ArmyName, OrderedSet<UnitType>>().set(ArmyName.Attacker, getDefaultTypes()).set(ArmyName.Defender, getDefaultTypes()),
  definitions: Map<ArmyName, Map<UnitType, UnitDefinition>>().set(ArmyName.Attacker, getDefaultDefinitions()).set(ArmyName.Defender, getDefaultDefinitions())
}
export const globalStatsState = Map<ArmyName, UnitDefinition>().set(ArmyName.Attacker, getDefaultGlobalDefinition()).set(ArmyName.Defender, getDefaultGlobalDefinition())

export const unitsReducer = createReducer(unitsState)
  .handleAction(setValue, (state, action: ReturnType<typeof setValue>) => (
    {
      ...state,
      definitions: state.definitions.updateIn([action.payload.army, action.payload.unit], (unit: UnitDefinition) => (
        addValues(unit, action.payload.type, action.payload.key, [[action.payload.attribute, action.payload.value]])
      ))
    }
  ))
  .handleAction(deleteUnit, (state, action: ReturnType<typeof deleteUnit>) => (
    {
      ...state,
      definitions: state.definitions.deleteIn([action.payload.army, action.payload.type]),
      types: state.types.deleteIn([action.payload.army, action.payload.type])
    }
  ))
  .handleAction(addUnit, (state, action: ReturnType<typeof addUnit>) => (
    {
      ...state,
      definitions: state.definitions.setIn([action.payload.army, action.payload.type], { type: action.payload.type, image: '' }),
      types: state.types.update(action.payload.army, value => value.add(action.payload.type))
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
      types: state.types.update(action.payload.army, value => value.toList().map(value => value === action.payload.old_type ? action.payload.new_type : value).toOrderedSet())
    }
  ))
  .handleAction(createArmy, (state, action: ReturnType<typeof createArmy>) => (
    {
      ...state,
      definitions: state.definitions.set(action.payload.army, getDefaultDefinitions()),
      types: state.types.set(action.payload.army, getDefaultTypes())
    }
  ))
  .handleAction(duplicateArmy, (state, action: ReturnType<typeof duplicateArmy>) => (
    {
      ...state,
      definitions: state.definitions.set(action.payload.army, state.definitions.get(action.payload.source) || getDefaultDefinitions()),
      types: state.types.set(action.payload.army, state.types.get(action.payload.source) || getDefaultTypes())
    }
  ))
  .handleAction(deleteArmy, (state, action: ReturnType<typeof deleteArmy>) => (
    {
      ...state,
      definitions: state.definitions.delete(action.payload.army),
      types: state.types.delete(action.payload.army)
    }
  ))
  .handleAction(changeName, (state, action: ReturnType<typeof changeName>) => (
    {
      ...state,
      definitions: state.definitions.mapKeys(key => key === action.payload.old_army ? action.payload.new_army : key),
      types: state.types.mapKeys(key => key === action.payload.old_army ? action.payload.new_army : key)
    }
  ))

export const globalStatsReducer = createReducer(globalStatsState)
  .handleAction(setGlobalValue, (state, action: ReturnType<typeof setGlobalValue>) => (
    state.update(action.payload.army, unit => addValues(unit, action.payload.type, action.payload.key, [[action.payload.attribute, action.payload.value]]))
  ))
  .handleAction(createArmy, (state, action: ReturnType<typeof createArmy>) => (
    state.set(action.payload.army, getDefaultGlobalDefinition())
  ))
  .handleAction(duplicateArmy, (state, action: ReturnType<typeof duplicateArmy>) => (
    state.set(action.payload.army, state.get(action.payload.source) || getDefaultGlobalDefinition())
  ))
  .handleAction(deleteArmy, (state, action: ReturnType<typeof deleteArmy>) => (
    state.delete(action.payload.army)
  ))
  .handleAction(changeName, (state, action: ReturnType<typeof changeName>) => (
    state.mapKeys(key => key === action.payload.old_army ? action.payload.new_army : key)
  ))
