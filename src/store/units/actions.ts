import { createAction } from 'typesafe-actions'
import { UnitType, ArmyType, ValueType } from '../units'

export const setBaseValue = createAction('@@units/SET_BASE_VALUE', action => {
  return (army: ArmyType, unit: UnitType, key: string, attribute: ValueType, value: number) => action({ army, unit, key, attribute, value })
})

export const setModifierValue = createAction('@@units/SET_MODIFIER_VALUE', action => {
  return (army: ArmyType, unit: UnitType, key: string, attribute: ValueType, value: number) => action({ army, unit, key, attribute, value })
})

export const setLossValue = createAction('@@units/SET_LOSS_VALUE', action => {
  return (army: ArmyType, unit: UnitType, key: string, attribute: ValueType, value: number) => action({ army, unit, key, attribute, value })
})

export const setGlobalBaseValue = createAction('@@units/SET_GLOBAL_BASE_VALUE', action => {
  return (army: ArmyType, key: string, attribute: ValueType, value: number) => action({ army, key, attribute, value })
})

export const setGlobalModifierValue = createAction('@@units/SET_GLOBAL_MODIFIER_VALUE', action => {
  return (army: ArmyType, key: string, attribute: ValueType, value: number) => action({ army, key, attribute, value })
})

export const setGlobalLossValue = createAction('@@units/SET_GLOBAL_LOSS_VALUE', action => {
  return (army: ArmyType, key: string, attribute: ValueType, value: number) => action({ army, key, attribute, value })
})
