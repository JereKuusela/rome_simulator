import { createAction } from 'typesafe-actions'
import { ValueType, TacticType } from '../tactics'

export const setBaseValue = createAction('@@tactics/SET_BASE_VALUE', action => {
  return (tactic: TacticType, value_type: ValueType, key: string, value: number) => action({ tactic, value_type, key, value })
})
