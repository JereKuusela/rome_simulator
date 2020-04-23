import { combineReducers } from 'redux'
import { getTraditionDefinitions, getTradeDefinitions, getHeritageDefinitions, getOmenDefinitions, getPolicyDefinitions, getLawDefinitions, getIdeaDefinitions } from 'data'

const create =<T>(data: () => T) => (state = data()) => state

export const dataReducer = combineReducers({
  traditions: create(getTraditionDefinitions),
  trades: create(getTradeDefinitions),
  heritages: create(getHeritageDefinitions),
  omens: create(getOmenDefinitions),
  economy: create(getPolicyDefinitions),
  laws: create(getLawDefinitions),
  ideas: create(getIdeaDefinitions)
})
