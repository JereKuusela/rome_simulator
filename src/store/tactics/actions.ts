import { createAction } from 'typesafe-actions'
import { ValueType, TacticType } from '../tactics'

export const setBaseValue = createAction('@@tactics/SET_BASE_VALUE', action => {
  return (tactic: TacticType, key: string, attribute: ValueType, value: number) => action({ tactic,  key, attribute, value })
})
