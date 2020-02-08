import * as manager from 'managers/countries'
import { Countries } from 'types'
import { getDefaultCountryDefinitions } from 'data'
import { makeContainerReducer, ActionToFunction, makeActionRemoveFirst } from './utils'

const actionToFunction: ActionToFunction<Countries> = {}

export const createCountry = makeActionRemoveFirst(manager.createCountry, 'createCountry', actionToFunction)
export const deleteCountry = makeActionRemoveFirst(manager.deleteCountry, 'deleteCountry', actionToFunction)
export const changeCountryName = makeActionRemoveFirst(manager.changeCountryName, 'changeCountryName', actionToFunction)

export const countriesReducer = makeContainerReducer(getDefaultCountryDefinitions(), actionToFunction)
