import { action } from 'typesafe-actions'

import { UnitType, UnitCalc } from '../units'
import { UnitActionTypes } from './types'

export const setAttackerBaseValue = (type: UnitType, value_type: UnitType | UnitCalc, key: string, value: number) => {
    return action(UnitActionTypes.SET_ATTACKER_BASE_VALUE, {type, value_type, key, value})
}

export const setAttackerModifierValue = (type: UnitType, value_type: UnitType | UnitCalc, key: string, value: number) => {
    return action(UnitActionTypes.SET_ATTACKER_MODIFIER_VALUE, {type, value_type, key, value})
}
