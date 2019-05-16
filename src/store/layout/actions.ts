import { createAction } from 'typesafe-actions'

import { ArmyType, UnitDefinition } from '../units'

export const setUnitModal = createAction('@@layout/SET_UNIT_MODAL', action => {
  return (army: ArmyType | null, unit: UnitDefinition | null) => action({ army: army, unit: unit })
})
