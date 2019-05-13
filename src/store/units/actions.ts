import { action } from 'typesafe-actions'

import { UnitType, UnitCalc, ArmyType } from '../units'
import { UnitActionTypes } from './types'

export const setBaseValue = (army: ArmyType, type: UnitType, value_type: UnitType | UnitCalc, key: string, value: number) => {
    return action(UnitActionTypes.SET_BASE_VALUE, {army, type, value_type, key, value})
}

export const setModifierValue = (army: ArmyType, type: UnitType, value_type: UnitType | UnitCalc, key: string, value: number) => {
    return action(UnitActionTypes.SET_MODIFIER_VALUE, {army, type, value_type, key, value})
}
