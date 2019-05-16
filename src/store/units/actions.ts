import { createAction } from 'typesafe-actions'
import { UnitType, ArmyType, ValueType } from '../units'

export const setBaseValue = createAction('@@units/SET_BASE_VALUE', action => {
  return (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => action({ army, type, value_type, key, value })
})

export const setModifierValue = createAction('@@units/SET_MODIFIER_VALUE', action => {
  return (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => action({ army, type, value_type, key, value })
})

export const setLossValue = createAction('@@units/SET_LOSS_VALUE', action => {
  return (army: ArmyType, type: UnitType, value_type: ValueType, key: string, value: number) => action({ army, type, value_type, key, value })
})
