import { createReducer } from 'typesafe-actions'
import { OrderedMap, Map } from 'immutable'
import { CombatParameter, changeParameter, toggleSimpleMode, toggleMode } from './actions'
import { getDefaultLandSettings, getDefaultNavalSettings, getDefaultAnySettings } from './data'
import { DefinitionType } from '../../base_definition'

export const settingsState = {
  combat: Map<DefinitionType, OrderedMap<CombatParameter, number>>()
    .set(DefinitionType.Global, getDefaultAnySettings())
    .set(DefinitionType.Land, getDefaultLandSettings())
    .set(DefinitionType.Naval, getDefaultNavalSettings()),
    simple_mode: true,
    mode: DefinitionType.Land
}


export const settingsReducer = createReducer(settingsState)
  .handleAction(changeParameter, (state, action: ReturnType<typeof changeParameter>) => (
    { ...state, combat: state.combat.setIn([action.payload.mode, action.payload.key], action.payload.value) }
  ))
  .handleAction(toggleSimpleMode, (state, action: ReturnType<typeof toggleSimpleMode>) => (
    { ...state, simple_mode: !state.simple_mode }
  ))
  .handleAction(toggleMode, (state, action: ReturnType<typeof toggleMode>) => (
    { ...state, mode: state.mode === DefinitionType.Land ? DefinitionType.Naval : DefinitionType.Land }
  ))
