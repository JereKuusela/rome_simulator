import { createAction } from 'typesafe-actions'
import { ArmyType, UnitType } from '../units'

export const selectUnit = createAction('@@land_battle/SELECT_UNIT', action => {
  return (army: ArmyType, row: number, column: number, unit: UnitType) => action({ army, row, column, unit })
})
