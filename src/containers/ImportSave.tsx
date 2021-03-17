import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Mode,
  UnitPreferenceType,
  GeneralAttribute,
  UnitAttribute,
  CountryAttribute,
  SelectionType,
  ArmyName,
  CohortData,
  Save,
  SaveArmy,
  SaveCountry,
  UnitType,
  CountryDefinition
} from 'types'
import { createCountry } from 'reducers'
import { Button, Grid, Table, Header } from 'semantic-ui-react'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { uniq } from 'lodash'
import LabelItem from 'components/Utils/LabelUnit'
import { AppState } from 'state'
import {
  getDefaultUnits,
  countriesIR,
  heritagesIR,
  policiesIR,
  lawsIR,
  factionsIR,
  religionsIR,
  deitiesIR,
  effectsIR,
  traitsIR,
  tradesIR,
  ideasIR,
  abilitiesIR,
  culturesIR,
  getDefaultCountry
} from 'data'
import AttributeImage from 'components/Utils/AttributeImage'
import { toObj, toArr, map, keys } from 'utils'
import { calculateValueWithoutLoss } from 'definition_values'
import { parseFile, binaryToPlain } from 'managers/importer'
import JSZip from 'jszip'
import { getFirstPlayedCountry, loadCountryWithArmies } from 'managers/saves'
import { FileInput } from 'components/Utils/Input'
import { Tech } from 'types/generated'
import {
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

const countTech = (country: SaveCountry, tech: Tech) =>
  country.inventions.filter(invention => invention.tech === tech).length + ' inventions'

const RenderCountry = ({ country }: { country: SaveCountry }) => {
  return (
    <>
      <Table.Row>
        <Table.Cell>Country</Table.Cell>
        <Table.Cell>{country.name}</Table.Cell>
        <Table.Cell>Controller</Table.Cell>
        <Table.Cell>{country.isPlayer ? 'Player' : 'AI'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Civic tech</Table.Cell>
        <Table.Cell>
          Level {country.civicTech} with {countTech(country, Tech.Civic)}
        </Table.Cell>
        <Table.Cell>Martial tech</Table.Cell>
        <Table.Cell>
          Level {country.martialTech} with {countTech(country, Tech.Martial)}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Oratory tech</Table.Cell>
        <Table.Cell>
          Level {country.oratoryTech} with {countTech(country, Tech.Oratory)}
        </Table.Cell>
        <Table.Cell>Religious tech</Table.Cell>
        <Table.Cell>
          Level {country.religiousTech} with {countTech(country, Tech.Religious)}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Culture</Table.Cell>
        <Table.Cell>{culturesIR[country.culture]}</Table.Cell>
        <Table.Cell>Heritage</Table.Cell>
        <Table.Cell>{heritagesIR[country.heritage]?.name}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Army</Table.Cell>
        <Table.Cell>
          {
            policiesIR
              .find(policy => policy.find(option => option.key === country.armyMaintenance))
              ?.find(option => option.key === country.armyMaintenance)?.name
          }
        </Table.Cell>
        <Table.Cell>Navy</Table.Cell>
        <Table.Cell>
          {
            policiesIR
              .find(policy => policy.find(option => option.key === country.navalMaintenance))
              ?.find(option => option.key === country.navalMaintenance)?.name
          }
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Military experience</Table.Cell>
        <Table.Cell>{country.militaryExperience}</Table.Cell>
        <Table.Cell>Traditions</Table.Cell>
        <Table.Cell>{country.traditions.length}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Capital surplus</Table.Cell>
        <Table.Cell>
          {country.surplus
            .map(key => tradesIR[key]?.name)
            .filter(value => value)
            .join(', ')}
        </Table.Cell>
        <Table.Cell>Ideas</Table.Cell>
        <Table.Cell>
          {country.ideas
            .map(key => ideasIR[key]?.name)
            .filter(value => value)
            .join(', ')}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Laws</Table.Cell>
        <Table.Cell>
          {country.laws
            .map(key => lawsIR[key]?.name)
            .filter(value => value)
            .join(', ')}
        </Table.Cell>
        <Table.Cell />
        <Table.Cell />
      </Table.Row>
      <Table.Row>
        <Table.Cell>Government</Table.Cell>
        <Table.Cell>{country.government}</Table.Cell>
        <Table.Cell>Faction</Table.Cell>
        <Table.Cell>{factionsIR[country.faction]?.name}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Religion</Table.Cell>
        <Table.Cell>
          {religionsIR[country.religion]?.name} ({country.religiousUnity.toPrecision(3)}%)
        </Table.Cell>
        <Table.Cell>Deities</Table.Cell>
        <Table.Cell>
          {country.deities
            .map(key =>
              deitiesIR[key]
                ? deitiesIR[key].name + (country.omen.substr(4) === key.substr(5) ? ' (with omen)' : '')
                : null
            )
            .filter(value => value)
            .join(', ')}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Modifiers</Table.Cell>
        <Table.Cell colSpan='3'>
          {country.modifiers
            .map(key => effectsIR[key]?.name)
            .filter(value => value)
            .join(', ')}
        </Table.Cell>
      </Table.Row>
    </>
  )
}

const RenderArmy = ({ army }: { army: SaveArmy }) => {
  const tactics = useSelector((state: AppState) => state.tactics)
  const units = getDefaultUnits()
  const cohorts = army.cohorts.map(cohort => cohort.type)
  const types = uniq(cohorts)
  const counts = toObj(
    types,
    type => type,
    type => cohorts.filter(item => item === type).length
  )
  const ability = abilitiesIR
    .find(abilities => abilities.find(ability => ability.key === army.ability))
    ?.find(ability => ability.key === army.ability)?.name
  return (
    <React.Fragment key={army.id}>
      <Table.Row>
        <Table.Cell />
        <Table.Cell />
        <Table.Cell />
        <Table.Cell />
      </Table.Row>
      <Table.Row>
        <Table.Cell>Name</Table.Cell>
        <Table.Cell colSpan='3'>{army.name}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>{army.mode === Mode.Naval ? 'Adminal' : 'General'}</Table.Cell>
        <Table.Cell>{army.leader ? army.leader.name : ''}</Table.Cell>
        <Table.Cell>
          {army.leader ? (
            <>
              <AttributeImage attribute={GeneralAttribute.Martial} />
              {' ' + (army.leader.martial + army.leader.traitMartial)}
            </>
          ) : (
            ''
          )}
        </Table.Cell>
        <Table.Cell>{army.leader ? army.leader.traits.map(key => traitsIR[key]?.name).join(', ') : ''}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Tactic / Ability</Table.Cell>
        <Table.Cell>
          <LabelItem item={tactics[army.tactic]} />
          {ability ? ' / ' + ability : null}
        </Table.Cell>
        <Table.Cell>Flank size</Table.Cell>
        <Table.Cell>{army.flankSize}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Preferences</Table.Cell>
        <Table.Cell>
          <LabelItem item={units[army.preferences[UnitPreferenceType.Primary] ?? UnitType.Archers]} />
        </Table.Cell>
        <Table.Cell>
          <LabelItem item={units[army.preferences[UnitPreferenceType.Secondary] ?? UnitType.Archers]} />
        </Table.Cell>
        <Table.Cell>
          <LabelItem item={units[army.preferences[UnitPreferenceType.Flank] ?? UnitType.Archers]} />
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Cohorts</Table.Cell>
        <Table.Cell colSpan='3'>
          {toArr(counts, (value, key) => (
            <span key={key} style={{ paddingRight: '1em' }}>
              <LabelItem item={units[key]} />
              {' x ' + value}
            </span>
          ))}
        </Table.Cell>
      </Table.Row>
    </React.Fragment>
  )
}

const parseSave = (data: string) => parseFile(data) as Save

const loadFile = async (file: File) => {
  try {
    const zipped = await new JSZip().loadAsync(file)
    const extracted = zipped.file('gamestate')
    if (!extracted) return undefined
    const buffer = await extracted.async('uint8array')
    return parseSave(binaryToPlain(buffer, false)[0])
  } catch (e) {
    return parseSave(await file.text())
  }
}

const getTagName = (tag: string) =>
  countriesIR[tag.toLowerCase()] ? countriesIR[tag.toLowerCase()] + ' (' + tag + ')' : tag

const getCountryList = (save: Save) => {
  const data = save.country?.country_database
  if (data) {
    return keys(data).map(key => ({ text: getTagName(data[Number(key)].tag), value: key }))
  }
  return []
}

const convertArmy = (country: CountryDefinition, army: SaveArmy) => {
  const armyName = army.name
  // Country must have at least one army per mode so only delete the default one if importing anything.
  if (army.mode === Mode.Land) deleteArmy(country, ArmyName.Army)
  else deleteArmy(country, ArmyName.Navy)
  createArmy(country, armyName, army.mode)
  const armyData = country.armies[armyName]
  if (army.leader) {
    setGeneralAttribute(armyData, GeneralAttribute.Martial, army.leader.martial)
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
  const cohorts: CohortData[] = army.cohorts.map(cohort => ({
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
  enableCountrySelections(countryData, SelectionType.Modifier, country.modifiers)
  enableCountrySelection(countryData, SelectionType.Policy, country.armyMaintenance)
  enableCountrySelection(countryData, SelectionType.Policy, country.navalMaintenance)
  enableCountrySelection(countryData, SelectionType.Religion, country.religion)
  enableCountrySelection(countryData, SelectionType.Faction, country.faction)
  setCountryAttribute(countryData, CountryAttribute.OmenPower, country.religiousUnity - 100)
  armies.forEach(army => convertArmy(countryData, army))
  return countryData
}

const ImportSave = () => {
  const [country, setCountry] = useOptionalState<SaveCountry>()
  const countryData = useRef<CountryDefinition>()
  const [armies, setArmies] = useState<SaveArmy[]>([])
  const [save, setSave] = useOptionalState<Save>()
  const countries = save ? getCountryList(save) : []

  const selectCountry = useCallback(
    (save: Save, id: string) => {
      const { country, armies } = loadCountryWithArmies(save, id)
      if (country) {
        setCountry(country)
        setArmies(armies)
        countryData.current = convertCountry(country, armies)
      }
    },
    [setCountry, setArmies]
  )

  useEffect(() => {
    if (!save) return
    const firstPlayer = getFirstPlayedCountry(save)
    if (firstPlayer) selectCountry(save, String(firstPlayer))
  }, [save, selectCountry])

  const handleChangeCountry = (id: string) => {
    if (!save) return
    selectCountry(save, id)
  }

  const handleFile = async (file: File) => {
    const save = file && (await loadFile(file))
    setCountry(undefined)
    setArmies([])
    setSave(save)
  }

  const dispatch = useDispatch()
  const handleImport = () => {
    if (countryData.current) dispatch(createCountry(countryData.current.name, countryData.current))
  }

  return (
    <Grid padded>
      <Grid.Row>
        <Grid.Column verticalAlign='middle'>
          <Header style={{ display: 'inline' }}>Select a save game to import</Header>
          <FileInput style={{ display: 'inline' }} onChange={handleFile} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns='4'>
        <Grid.Column>
          <SimpleDropdown
            value={String(country?.id ?? '')}
            values={countries}
            search
            onChange={countries.length ? handleChangeCountry : undefined}
            placeholder='Select country'
          />
        </Grid.Column>
        <Grid.Column>
          <Button onClick={handleImport} disabled={!country}>
            Import
          </Button>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Table>
            <Table.Body>
              {country && <RenderCountry country={country} />}
              {armies.map(army => (
                <RenderArmy key={army.id} army={army} />
              ))}
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default ImportSave
