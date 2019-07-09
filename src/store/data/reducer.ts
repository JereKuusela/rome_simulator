import { createReducer } from 'typesafe-actions'
import { combineReducers } from 'redux'
import { getTraditionDefinitions, getTradeDefinitions, getHeritageDefinitions, getInventionDefinitions, getOmenDefinitions, getTraitDefinitions } from './data'

export const dataReducer = combineReducers({
  traditions: createReducer(getTraditionDefinitions()),
  trades: createReducer(getTradeDefinitions()),
  heritages: createReducer(getHeritageDefinitions()),
  inventions: createReducer(getInventionDefinitions()),
  omens: createReducer(getOmenDefinitions()),
  traits: createReducer(getTraitDefinitions())
})
