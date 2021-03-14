import { convertUnitDefinitions, filterUnitDefinitions } from 'army_utils'
import { applyGeneralModifiers, convertGeneralDefinition } from 'managers/army'
import { getCountryModifiers, getGeneralModifiers } from 'managers/modifiers'
import { applyUnitModifiers } from 'managers/units'
import createCachedSelector from 're-reselect'
import { AppState } from 'state'
import { ArmyName, CountryName } from 'types'

type Key = { countryName: CountryName; armyName: ArmyName }

const getKey = (_: AppState, props: Key) => props.countryName + '|' + props.armyName

const getMode = (state: AppState) => state.settings.mode
const getSiteSettings = (state: AppState) => state.settings.siteSettings
const getTactics = (state: AppState) => state.tactics
const getCountry = (state: AppState, props: Key) => state.countries[props.countryName]
const getUnits = (state: AppState, props: Key) => state.countries[props.countryName].units
const getGeneral = (state: AppState, props: Key) => getCountry(state, props).armies[props.armyName].general

const getGeneralModifiers2 = createCachedSelector([getGeneral], general => {
  return getGeneralModifiers(general)
})(getKey)

const getGeneralData = createCachedSelector([getGeneral, getGeneralModifiers2], (general, modifiers) => {
  return applyGeneralModifiers(general, modifiers)
})(getKey)

export const getGeneralDefinition = createCachedSelector(
  [getSiteSettings, getGeneralData, getTactics],
  (settings, general, tactics) => convertGeneralDefinition(settings, general, tactics)
)(getKey)

const getCountryModifiers2 = createCachedSelector([getCountry], country => {
  return getCountryModifiers(country.modifiers)
})(getKey)

const getSubDefinitions = createCachedSelector(
  [getUnits, getCountryModifiers2, getGeneralModifiers2],
  (units, countryModifiers, generalModifiers) => {
    return applyUnitModifiers(units, countryModifiers.concat(generalModifiers))
  }
)(getKey)

export const getUnitDefinitions = createCachedSelector(
  [getMode, getGeneralData, getSiteSettings, getSubDefinitions],
  (mode, generalData, settings, subDefinitions) => {
    const general = generalData.definitions
    const units = convertUnitDefinitions(settings, subDefinitions, general)
    return filterUnitDefinitions(mode, units)
  }
)(getKey)
