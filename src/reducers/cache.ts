import { ActionToFunction, makeActionRemoveFirst, makeContainerReducer } from './utils'
import { ArmyName, CountryName, GeneralDefinition, UnitDefinitions } from 'types'

type Cache = {
  units: { [key in CountryName]: { [key in ArmyName]: UnitDefinitions } }
  generals: { [key in CountryName]: { [key in ArmyName]: GeneralDefinition } }
}

const mapping: ActionToFunction<Cache, CountryName, ArmyName> = {}

const setUnits = (cache: Cache, countryName: CountryName, armyName: ArmyName, units: UnitDefinitions) => {
  const definitions = cache.units
  if (!definitions[countryName]) definitions[countryName] = {} as { [key in ArmyName]: UnitDefinitions }
  Object.freeze(units)
  definitions[countryName][armyName] = units
}

const setGeneral = (cache: Cache, countryName: CountryName, armyName: ArmyName, general: GeneralDefinition) => {
  const definitions = cache.generals
  if (!definitions[countryName]) definitions[countryName] = {} as { [key in ArmyName]: GeneralDefinition }
  Object.freeze(general)
  definitions[countryName][armyName] = general
}

export const setCacheUnitDefinitions = makeActionRemoveFirst(setUnits, mapping)
export const setCacheGeneralDefinition = makeActionRemoveFirst(setGeneral, mapping)

export const cacheReducer = makeContainerReducer({ units: {}, generals: {} } as Cache, mapping)
