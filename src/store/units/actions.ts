import { createAction } from 'typesafe-actions'
import { UnitType, ArmyName, ValueType } from '../units'
import { ValuesType } from '../../utils'

export const setValue = createAction('@@units/SET_VALUE', action => {
  return (army: ArmyName, type: ValuesType, unit: UnitType, key: string, attribute: ValueType, value: number) => action({ army,type,  unit, key, attribute, value })
})
export const setGlobalValue = createAction('@@units/SET_GLOBAL_VALUE', action => {
  return (army: ArmyName, type: ValuesType, key: string, attribute: ValueType, value: number) => action({ army, type, key, attribute, value })
})
