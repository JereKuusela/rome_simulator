import { action } from 'typesafe-actions'

import { UnitType } from '../units'
import { UnitActionTypes } from './types'

export const setAttackerBaseValue = (type: UnitType, key: string, value: number) => action(UnitActionTypes.SET_ATTACKER_BASE_VALUE, {type, key, value})
