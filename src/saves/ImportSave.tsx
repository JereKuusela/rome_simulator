import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Mode,
  UnitPreferenceType,
  CharacterAttribute,
  UnitAttribute,
  CountryAttribute,
  SelectionType,
  ArmyName,
  CohortData,
  CountryDefinition,
  Country,
  CountryData
} from 'types'
import { importCountry } from 'reducers'
import { Button, Grid, Table } from 'semantic-ui-react'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { getDefaultCountry } from 'data'
import { map } from 'utils'
import { calculateValueWithoutLoss } from 'data_values'
import { getFirstPlayedCountry, loadArmies, loadCountry, loadCountryList } from './manager'
import {
  convertCountryData,
  convertCountryDefinition,
  createArmy,
  deleteArmy,
  enableCountrySelection,
  enableCountrySelections,
  setCountryAttribute
} from 'managers/countries'
import {
  addToReserve,
  enableGeneralSelection,
  enableGeneralSelections,
  selectTactic,
  setFlankSize,
  setGeneralAttribute,
  setHasGeneral,
  setUnitPreference
} from 'managers/army'
import { convertUnitsData } from 'managers/units'
import { useOptionalState } from 'components/hooks'
import { SaveCountry, SaveArmy, Save } from './types'
import TableRowsSaveCountry from './TableRowsSaveCountry'
import TableRowsSaveArmy from './TableRowsSaveArmy'
import InputImportSave from './InputImportSave'

const convertArmy = (country: CountryDefinition, army: SaveArmy) => {
  const armyName = army.name
  // Country must have at least one army per mode so only delete the default one if importing anything.
  if (army.mode === Mode.Land) deleteArmy(country, ArmyName.Army)
  else deleteArmy(country, ArmyName.Navy)
  createArmy(country, armyName, army.mode)
  const armyData = country.armies[armyName]
  if (army.leader) {
    setGeneralAttribute(armyData, CharacterAttribute.Martial, army.leader.baseAttributes[CharacterAttribute.Martial])
    enableGeneralSelection(armyData, SelectionType.Ability, army.ability)
    enableGeneralSelections(armyData, SelectionType.Trait, army.leader.traits)
  } else {
    setHasGeneral(armyData, false)
  }
  setFlankSize(armyData, army.flankSize)
  selectTactic(armyData, army.tactic)
  setUnitPreference(armyData, UnitPreferenceType.Primary, army.preferences[UnitPreferenceType.Primary])
  setUnitPreference(armyData, UnitPreferenceType.Secondary, army.preferences[UnitPreferenceType.Secondary])
  setUnitPreference(armyData, UnitPreferenceType.Flank, army.preferences[UnitPreferenceType.Flank])

  const units = convertUnitsData(country.units, country, armyData.general)
  const experiences = map(units, unit => calculateValueWithoutLoss(unit, UnitAttribute.Experience))
  const maxStrengths = map(units, unit => calculateValueWithoutLoss(unit, UnitAttribute.Strength))
  const maxMorales = map(units, unit => calculateValueWithoutLoss(unit, UnitAttribute.Morale))
  const withoutMissingData = army.cohorts.map(cohort => ({
    ...cohort,
    [UnitAttribute.Experience]: cohort[UnitAttribute.Experience] ?? experiences[cohort.type],
    [UnitAttribute.Strength]: cohort[UnitAttribute.Strength] ?? maxStrengths[cohort.type],
    [UnitAttribute.Morale]: cohort[UnitAttribute.Morale] ?? maxMorales[cohort.type]
  }))
  const cohorts: CohortData[] = withoutMissingData.map(cohort => ({
    type: cohort.type,
    baseValues: {
      [UnitAttribute.Experience]: {
        Custom: cohort[UnitAttribute.Experience] - experiences[cohort.type]
      }
    } as never,
    lossValues: {
      [UnitAttribute.Morale]: {
        Custom: maxMorales[cohort.type] - cohort[UnitAttribute.Morale]
      },
      [UnitAttribute.Strength]: {
        Custom: maxStrengths[cohort.type] - cohort[UnitAttribute.Strength]
      }
    } as never
  }))
  addToReserve(armyData, cohorts)
}

const convertCountry = (country: SaveCountry, armies: SaveArmy[]) => {
  const countryData = getDefaultCountry(country.name)
  setCountryAttribute(countryData, CountryAttribute.CivicTech, country.civicTech)
  setCountryAttribute(countryData, CountryAttribute.MartialTech, country.martialTech)
  setCountryAttribute(countryData, CountryAttribute.OratoryTech, country.oratoryTech)
  setCountryAttribute(countryData, CountryAttribute.ReligiousTech, country.religiousTech)
  setCountryAttribute(countryData, CountryAttribute.MilitaryExperience, country.militaryExperience)
  const traditions = country.traditions.map(item => item.key)
  enableCountrySelections(countryData, SelectionType.Tradition, traditions)
  const inventions = country.inventions.map(item => item.key)
  enableCountrySelections(countryData, SelectionType.Invention, inventions)
  enableCountrySelection(countryData, SelectionType.Heritage, country.heritage)
  enableCountrySelections(countryData, SelectionType.Trade, country.surplus)
  enableCountrySelections(countryData, SelectionType.Idea, country.ideas)
  enableCountrySelections(countryData, SelectionType.Law, country.laws)
  enableCountrySelections(countryData, SelectionType.Deity, country.deities)
  if (country.omen) enableCountrySelection(countryData, SelectionType.Deity, 'omen' + country.omen)
  enableCountrySelections(countryData, SelectionType.Effect, country.modifiers)
  enableCountrySelection(countryData, SelectionType.Policy, country.armyMaintenance)
  enableCountrySelection(countryData, SelectionType.Policy, country.navalMaintenance)
  enableCountrySelection(countryData, SelectionType.Religion, country.religion)
  enableCountrySelection(countryData, SelectionType.Faction, country.faction)
  setCountryAttribute(countryData, CountryAttribute.OmenPower, country.religiousUnity - 100)
  armies.forEach(army => convertArmy(countryData, army))
  return countryData
}

const ImportSave = () => {
  const [saveCountry, setCountry] = useOptionalState<SaveCountry>()
  const countryData = useRef<CountryData>()
  const country = useRef<Country>()
  const [armies, setArmies] = useState<SaveArmy[]>([])
  const [save, setSave] = useOptionalState<Save>()
  const countries = save ? loadCountryList(save) : []

  const selectCountry = useCallback(
    (save: Save, id: number) => {
      const saveCountry = loadCountry(save, id)
      if (saveCountry) {
        setCountry(saveCountry)

        country.current = convertCountryDefinition(convertCountryData(convertCountry(saveCountry, [])))
        const armies = loadArmies(save, saveCountry, country.current)
        setArmies(armies)
        countryData.current = convertCountry(saveCountry, armies)
      }
    },
    [setCountry, setArmies]
  )

  useEffect(() => {
    if (!save) return
    const firstPlayer = getFirstPlayedCountry(save)
    if (firstPlayer) selectCountry(save, firstPlayer)
  }, [save, selectCountry])

  const handleChangeCountry = (id: string) => {
    if (!save) return
    selectCountry(save, Number(id))
  }

  const handleImportSave = (save: Save) => {
    setCountry(undefined)
    setArmies([])
    setSave(save)
  }

  const dispatch = useDispatch()
  const handleImport = () => {
    if (countryData.current) dispatch(importCountry(countryData.current))
  }

  return (
    <Grid padded>
      <Grid.Row>
        <Grid.Column verticalAlign='middle'>
          <InputImportSave onImported={handleImportSave} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns='4'>
        <Grid.Column>
          <SimpleDropdown
            value={String(saveCountry?.id ?? '')}
            values={countries}
            search
            onChange={countries.length ? handleChangeCountry : undefined}
            placeholder='Select country'
          />
        </Grid.Column>
        <Grid.Column>
          <Button onClick={handleImport} disabled={!saveCountry}>
            Import
          </Button>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Table>
            <Table.Body>
              <TableRowsSaveCountry saveCountry={saveCountry} country={country.current} />
              {armies.map(army => (
                <TableRowsSaveArmy key={army.id} army={army} />
              ))}
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default ImportSave
