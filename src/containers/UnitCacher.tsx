import { convertUnitDefinitions, filterUnitDefinitions } from 'army_utils'
import { applyGeneralModifiers, convertGeneralDefinition } from 'managers/army'
import { applyCountryModifiers } from 'managers/countries'
import { getCountryModifiers, getGeneralModifiers, getSecondaryCountryModifiers } from 'managers/modifiers'
import { applyUnitModifiers } from 'managers/units'
import React, { Fragment, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { setCacheGeneralDefinition, setCacheUnitDefinitions } from 'reducers'
import { useCountries, useCountry, useMode, useSiteSettings, useTactics } from 'state'
import { ArmyData, ArmyName, CountryName, GeneralData } from 'types'
import { toArr } from 'utils'

/**
 * Non-visual component which automatically caches unit definitions.
 */
const UnitCacher = (): JSX.Element => {
  const countries = useCountries()
  const mode = useMode()
  return (
    <>
      {toArr(countries, (country, countryName) => {
        return (
          <Fragment key={countryName}>
            {toArr(country.armies, (army, armyName) => {
              if (army.mode !== mode) return null
              return (
                <UnitCacherSub
                  key={`${countryName}_${armyName}`}
                  countryName={countryName}
                  army={army}
                  armyName={armyName}
                />
              )
            })}
          </Fragment>
        )
      })}
    </>
  )
}

interface CacherProps {
  army: ArmyData
  countryName: CountryName
  armyName: ArmyName
}

const UnitCacherSub = ({ countryName, armyName, army }: CacherProps): null => {
  const country = useCountry(countryName)
  const settings = useSiteSettings()
  const dispatch = useDispatch()
  const mode = useMode()
  const tactics = useTactics()

  const generalData = useMemo((): GeneralData => {
    const modifiers = getGeneralModifiers(army.general)
    return applyGeneralModifiers(army.general, modifiers)
  }, [army.general])

  const subDefinitions = useMemo(() => {
    const units = country.units
    const countryModifiers = getCountryModifiers(country)
    const secondaryCountryModifiers = getSecondaryCountryModifiers(applyCountryModifiers(country, countryModifiers))
    const generalModifiers = getGeneralModifiers(generalData)
    return applyUnitModifiers(units, countryModifiers.concat(secondaryCountryModifiers).concat(generalModifiers))
  }, [country, generalData])

  const generalDefinition = useMemo(() => {
    return convertGeneralDefinition(settings, generalData, tactics)
  }, [settings, generalData, tactics])

  const definitions = useMemo(() => {
    const general = generalData.definitions
    const units = convertUnitDefinitions(settings, subDefinitions, general)
    return filterUnitDefinitions(mode, units)
  }, [settings, subDefinitions, generalData, mode])

  useEffect(() => {
    dispatch(setCacheUnitDefinitions(countryName, armyName, definitions))
  }, [dispatch, countryName, armyName, definitions])

  useEffect(() => {
    dispatch(setCacheGeneralDefinition(countryName, armyName, generalDefinition))
  }, [dispatch, countryName, armyName, generalDefinition])
  return null
}

export default UnitCacher
