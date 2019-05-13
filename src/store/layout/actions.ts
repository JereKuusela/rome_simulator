import { action } from 'typesafe-actions'

import { UnitDefinition } from '../units'
import { LayoutActionTypes } from './types'

// Here we use the `action` helper function provided by `typesafe-actions`.
// This library provides really useful helpers for writing Redux actions in a type-safe manner.
// For more info: https://github.com/piotrwitek/typesafe-actions
//
// Remember, you can also pass parameters into an action creator. Make sure to
// type them properly as well.

export const setUnitModal = (unit: UnitDefinition | null) => action(LayoutActionTypes.SET_UNIT_MODAL, unit)
