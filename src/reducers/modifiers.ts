import { combineReducers } from 'redux'
import { getTraditionDefinitions, getTradeDefinitions, getHeritageDefinitions, getOmenDefinitions, getTraitDefinitions, getEconomyDefinitions, getLawDefinitions, getIdeaDefinitions, getAbilityDefinitions } from 'data'

const create =<T>(data: () => T) => (state = data()) => state

export const dataReducer = combineReducers({
  traditions: create(getTraditionDefinitions),
  trades: create(getTradeDefinitions),
  heritages: create(getHeritageDefinitions),
  omens: create(getOmenDefinitions),
  traits: create(getTraitDefinitions),
  economy: create(getEconomyDefinitions),
  laws: create(getLawDefinitions),
  ideas: create(getIdeaDefinitions),
  abilities: create(getAbilityDefinitions)
})
