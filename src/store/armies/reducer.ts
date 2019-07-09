import { createReducer } from 'typesafe-actions'
import { createArmy, deleteArmy, changeArmyName, selectCountry, enableModifiers, clearModifiers } from './actions'
import { CountryName } from '../countries/actions'
import { getInitialArmy, initialState } from '../battle'

/**
 * Handles non-combat related army management.
 */
export const armiesReducer = createReducer<typeof initialState>({} as any)
  .handleAction(createArmy, (state, action: ReturnType<typeof createArmy>) => (
    state.map((mode, key) => {
      return { ...mode, armies: mode.armies.set(action.payload.army, mode.armies.get(action.payload.source_army!, getInitialArmy(key, CountryName.Country1))) }
    })
  ))
  .handleAction(deleteArmy, (state, action: ReturnType<typeof deleteArmy>) => (
    state.map(mode => {
      return { ...mode, armies: mode.armies.delete(action.payload.army) }
    })
  ))
  .handleAction(changeArmyName, (state, action: ReturnType<typeof changeArmyName>) => (
    state.map(mode => {
      return { ...mode, armies: mode.armies.mapKeys(key => key === action.payload.old_army ? action.payload.army : key )}
    })
  ))
  .handleAction(selectCountry, (state, action: ReturnType<typeof selectCountry>) => (
    state.map(mode => {
      return { ...mode, armies: mode.armies.update(action.payload.army, value => ({ ...value, country: action.payload.country}))}
    })
  ))
  .handleAction(enableModifiers, (state, action: ReturnType<typeof enableModifiers>) => (
    state.map(mode => {
      return { ...mode, armies: mode.armies.update(action.payload.army, value => ({ ...value, selections: value.selections.add(action.payload.key)}))}
    })
  ))
  .handleAction(clearModifiers, (state, action: ReturnType<typeof clearModifiers>) => (
    state.map(mode => {
      return { ...mode, armies: mode.armies.update(action.payload.army, value => ({ ...value, selections: value.selections.remove(action.payload.key)}))}
    })
  ))
