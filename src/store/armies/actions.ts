
import { createAction } from 'typesafe-actions'
import { List } from 'immutable'
import { ArmyName } from '../battle'
import { CountryName } from '../countries'
import { Modifier } from '../data'

export const deleteArmy = createAction('@@armies/DELETE_ARMY', action => {
  return (army: ArmyName) => action({ army })
})

export const createArmy = createAction('@@armies/CREATE_ARMY', action => {
  return (army: ArmyName, source_army?: ArmyName) => action({ army, source_army })
})

export const changeArmyName = createAction('@@armies/CHANGE_ARMY_NAME', action => {
  return (old_army: ArmyName, army: ArmyName) => action({ old_army, army })
})

export const selectCountry = createAction('@@armies/SELECT_COUNTRY', action => {
  return (army: ArmyName, country: CountryName) => action({ army, country })
})

export const enableModifiers = createAction('@@armies/ENABLE_MODIFIERS', action => {
  return (army: ArmyName, key: string, modifiers: List<Modifier>) => action({ army, key, modifiers })
})

export const clearModifiers = createAction('@@armies/CLEAR_MODIFIERS', action => {
  return (army: ArmyName, key: string) => action({ army, key })
})
