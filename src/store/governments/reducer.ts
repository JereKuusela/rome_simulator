import { createReducer } from 'typesafe-actions'
import { getDefaultDefinitions, getDefaultTypes } from './data'
import { } from './actions'

export const governmentsState = {
  traditions: {
    types: getDefaultTypes(),
    definitions: getDefaultDefinitions()
  }
}

export const governmentReducer = createReducer(governmentsState)
