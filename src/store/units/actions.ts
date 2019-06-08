import { createAction } from 'typesafe-actions'
import { UnitType, ArmyName, ValueType } from '../units'
import { ValuesType } from '../../base_definition'

export const setValue = createAction('@@units/SET_VALUE', action => {
  return (army: ArmyName, type: ValuesType, unit: UnitType, key: string, attribute: ValueType, value: number) => action({ army,type,  unit, key, attribute, value })
})

export const setGlobalValue = createAction('@@units/SET_GLOBAL_VALUE', action => {
  return (army: ArmyName, type: ValuesType, key: string, attribute: ValueType, value: number) => action({ army, type, key, attribute, value })
})

export const deleteUnit = createAction('@@units/DELETE_UNIT', action => {
  return (army: ArmyName, type: UnitType) => action({ army, type })
})

export const addUnit = createAction('@@units/ADD_UNIT', action => {
  return (army: ArmyName, type: UnitType) => action({ army, type })
})

export const changeType = createAction('@@units/CHANGE_TYPE', action => {
  return (army: ArmyName, old_type: UnitType, new_type: UnitType) => action({ army, old_type, new_type })
})

export const changeImage = createAction('@@units/CHANGE_IMAGE', action => {
  return (army: ArmyName, type: UnitType, image: string) => action({ army, type, image })
})

export const deleteArmy = createAction('@@units/DELETE_ARMY', action => {
  return (army: ArmyName) => action({ army })
})

export const createArmy = createAction('@@units/CREATE_ARMY', action => {
  return (army: ArmyName) => action({ army })
})

export const changeName = createAction('@@units/CHANGE_NAME', action => {
  return (old_army: ArmyName, new_army: ArmyName) => action({ old_army, new_army })
})