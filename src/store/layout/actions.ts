import { createAction } from 'typesafe-actions'

import { ArmyType, UnitDefinition } from '../units'
import { TacticDefinition } from '../tactics'

export const setUnitModal = createAction('@@layout/SET_UNIT_MODAL', action => {
  return (army: ArmyType | null, unit: UnitDefinition | null) => action({ army, unit })
})

export const setTacticModal = createAction('@@layout/SET_TACTIC_MODAL', action => {
  return (tactic: TacticDefinition | null) => action({ tactic })
})
