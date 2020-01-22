import { combineReducers } from 'redux'
import { getTraditionDefinitions, getTradeDefinitions, getHeritageDefinitions, getInventionDefinitions, getOmenDefinitions, getTraitDefinitions, getEconomyDefinitions, getLawDefinitions, getIdeaDefinitions, getAbilityDefinitions } from 'data'

const create =<T>(data: () => T) => (state = data()) => state

export const dataReducer = combineReducers({
  traditions: create(getTraditionDefinitions),
  trades: create(getTradeDefinitions),
  heritages: create(getHeritageDefinitions),
  inventions: create( getInventionDefinitions),
  omens: create(getOmenDefinitions),
  traits: create(getTraitDefinitions),
  economy: create(getEconomyDefinitions),
  laws: create(getLawDefinitions),
  ideas: create(getIdeaDefinitions),
  abilities: create(getAbilityDefinitions)
})
