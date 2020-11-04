import { ActionToFunction, combine, makeActionRemoveFirst, makeContainerReducer } from './utils'
import { ArmyName, CountryName, UnitDefinitions } from 'types'

type Definitions = { [key in CountryName]: { [key in ArmyName]: UnitDefinitions } }

const unitsMapping: ActionToFunction<Definitions, CountryName, ArmyName> = {}

const setUnitsImplementation = (
  definitions: Definitions,
  countryName: CountryName,
  armyName: ArmyName,
  units: UnitDefinitions
) => {
  if (!definitions[countryName]) definitions[countryName] = {} as { [key in ArmyName]: UnitDefinitions }
  Object.freeze(units)
  definitions[countryName][armyName] = units
}

export const setUnits = makeActionRemoveFirst(setUnitsImplementation, unitsMapping)
const units = makeContainerReducer({} as Definitions, unitsMapping)

export const cacheReducer = combine({ units })
