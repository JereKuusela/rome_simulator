import { createAction } from 'typesafe-actions'
import { ValueType, TacticType } from '../tactics'

export const setBaseValue = createAction('@@tactics/SET_BASE_VALUE', action => {
  return (tactic: TacticType, key: string, attribute: ValueType, value: number) => action({ tactic,  key, attribute, value })
})

export const deleteTactic = createAction('@@tactics/DELETE_TACTIC', action => {
  return (type: TacticType) => action({ type })
})

export const addTactic = createAction('@@tactics/ADD_TACTIC', action => {
  return (type: TacticType) => action({ type })
})

export const changeType = createAction('@@tactics/CHANGE_TYPE', action => {
  return (old_type: TacticType, new_type: TacticType) => action({ old_type, new_type })
})

export const changeImage = createAction('@@tactics/CHANGE_IMAGE', action => {
  return (type: TacticType, image: string) => action({ type, image })
})