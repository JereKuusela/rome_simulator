import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import {
  SideType,
  UnitRole,
  CountryName,
  UnitType,
  UnitAttribute,
  filterAttributes,
  Setting,
  UnitDefinition,
  Mode,
  CountryAttribute,
  ArmyName,
  CultureType
} from 'types'
import { getImage, mapRange } from 'utils'
import {
  AppState,
  getUnitPreferences,
  getCountry,
  getMode,
  getOverridenReserveDefinitions,
  getSiteSettings,
  getUnitDefinitions
} from 'state'
import { addToReserve, removeFromReserve, setUnitPreference, selectCulture } from 'reducers'
import { getArchetypes, getActualUnits, getLatestUnits, getChildUnits, getRootUnit } from 'managers/army'
import UnitValueInput from './UnitValueInput'
import AttributeImage from 'components/Utils/AttributeImage'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { applyLosses } from 'managers/units'
import DropdownArchetype from 'components/Dropdowns/DropdownArchetype'
import { getCultures } from 'data'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'

type Props = {
  side: SideType
  countryName: CountryName
  armyName: ArmyName
  onRowClick: (country: CountryName, army: ArmyName, type: UnitType) => void
}

const getAttributes = (mode: Mode) => {
  if (process.env.REACT_APP_GAME === 'EU4')
    return [UnitAttribute.Discipline, UnitAttribute.Morale, UnitAttribute.CombatAbility]
  else {
    if (mode === Mode.Naval)
      return [UnitAttribute.Discipline, UnitAttribute.Morale, UnitAttribute.DamageDone, UnitAttribute.DamageTaken]
    return [UnitAttribute.Discipline, UnitAttribute.Morale, UnitAttribute.Offense, UnitAttribute.Defense]
  }
}

const TableUnitTypes = (props: Props): JSX.Element => {
  const { countryName, armyName, side } = props
  const dispatch = useDispatch()
  const { units, preferences, tech, mode, settings } = useSelector((state: AppState) => mapStateToProps(state, props))

  const checkPreference = useCallback(
    (role: UnitRole) => {
      const preference = preferences[role]
      const techRequirement = preference && units[preference] && units[preference].tech
      if (techRequirement && techRequirement > tech) {
        dispatch(setUnitPreference(countryName, armyName, role, null))
      }
    },
    [dispatch, preferences, countryName, armyName, tech, units]
  )

  useEffect(() => {
    checkPreference(UnitRole.Front)
    checkPreference(UnitRole.Flank)
    checkPreference(UnitRole.Support)
  }, [checkPreference])

  const unitList = settings[Setting.Tech] ? getArchetypes(units, mode) : getActualUnits(units, mode)
  return (
    <Table celled key={side} singleLine>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{side}</Table.HeaderCell>
          <Table.HeaderCell>Amount</Table.HeaderCell>
          {filterAttributes(getAttributes(mode), settings).map(attribute => (
            <Table.HeaderCell key={attribute}>
              <AttributeImage attribute={attribute} settings={settings} />
            </Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <RootUnitRow unit={getRootUnit(units, mode)} {...props} />
        {!settings[Setting.Tech] && unitList.map(unit => <UnitRow unit={unit} key={unit.type} {...props} />)}
        {settings[Setting.Tech] && <RoleRow role={UnitRole.Front} archetypes={unitList} {...props} />}
        {settings[Setting.Tech] && <RoleRow role={UnitRole.Flank} archetypes={unitList} {...props} />}
        {settings[Setting.Tech] && <RoleRow role={UnitRole.Support} archetypes={unitList} {...props} />}
      </Table.Body>
    </Table>
  )
}

const RootUnitRow = (props: { unit: UnitDefinition } & Props) => {
  const { unit, countryName, armyName, onRowClick } = props
  const { settings, culture, mode } = useSelector((state: AppState) => mapStateToProps(state, props))
  const dispatch = useDispatch()

  const onSelectCulture = (culture: CultureType) => {
    dispatch(selectCulture(countryName, culture, false))
  }

  if (!unit) return null
  const image = getImage(unit)
  return (
    <Table.Row key={unit.type}>
      <Table.Cell onClick={() => onRowClick(countryName, armyName, unit.type)} selectable>
        <Image src={image} avatar />
        {settings[Setting.Culture] ? (
          <SimpleDropdown values={getCultures()} value={culture} onChange={onSelectCulture} />
        ) : (
          'Army'
        )}
      </Table.Cell>
      <Table.Cell />
      {filterAttributes(getAttributes(mode), settings).map(attribute => (
        <Table.Cell key={attribute}>
          <UnitValueInput unit={unit} attribute={attribute} country={countryName} percent />
        </Table.Cell>
      ))}
    </Table.Row>
  )
}

const RoleRow = (props: { role: UnitRole; archetypes: UnitDefinition[] } & Props) => {
  const { countryName, armyName, onRowClick, archetypes, role } = props
  const dispatch = useDispatch()
  const { units, preferences, tech, mode, settings } = useSelector((state: AppState) => mapStateToProps(state, props))

  // List of archetypes -> get archetype -> get image
  const archetype = archetypes.find(unit => unit.role === role)
  const preference = preferences[role]
  if (!archetype || !preference) return null
  const image = getImage(archetype)
  const latestType = getLatestUnits(units, tech)
  const latest = { ...units[latestType[role] || archetype.type], type: UnitType.Latest }
  const children = [latest].concat(...getChildUnits(units, tech, archetype.type))
  return (
    <Table.Row key={role}>
      <Table.Cell onClick={() => onRowClick(countryName, armyName, archetype.type)} selectable className='padding'>
        <Image src={image} avatar />
        <DropdownArchetype
          value={preference}
          values={children}
          onSelect={type => dispatch(setUnitPreference(countryName, armyName, role, type))}
          settings={settings}
        />
      </Table.Cell>
      <Table.Cell>
        <CohortCount type={archetype.type} {...props} />
      </Table.Cell>
      {filterAttributes(getAttributes(mode), settings).map(attribute => (
        <Table.Cell key={attribute}>
          <UnitValueInput unit={archetype} attribute={attribute} country={countryName} percent />
        </Table.Cell>
      ))}
    </Table.Row>
  )
}

const UnitRow = (props: { unit: UnitDefinition } & Props) => {
  const { unit, countryName, armyName, onRowClick } = props
  const { mode, settings } = useSelector((state: AppState) => mapStateToProps(state, props))
  if (!unit) return null
  const image = getImage(unit)
  return (
    <Table.Row key={unit.type}>
      <Table.Cell onClick={() => onRowClick(countryName, armyName, unit.type)} selectable>
        <Image src={image} avatar />
        {unit.type}
      </Table.Cell>
      <Table.Cell>
        <CohortCount type={unit.type} {...props} />
      </Table.Cell>
      {filterAttributes(getAttributes(mode), settings).map(attribute => (
        <Table.Cell key={attribute}>
          <UnitValueInput unit={unit} attribute={attribute} country={countryName} percent />
        </Table.Cell>
      ))}
    </Table.Row>
  )
}

const CohortCount = (props: { type: UnitType } & Props) => {
  const dispatch = useDispatch()
  const { type, countryName, armyName } = props
  const { reserve, weariness } = useSelector((state: AppState) => mapStateToProps(state, props))
  const count = reserve.filter(cohort => cohort.type === type).length

  const updateReserve = useCallback(
    (amount: number) => {
      const previous = reserve.filter(cohort => cohort.type === type).length
      if (amount > previous) {
        const units = mapRange(amount - previous, _ => ({ type, image: '' }))
        dispatch(addToReserve(countryName, armyName, applyLosses(weariness, units)))
      }
      if (amount < previous) {
        const types = mapRange(previous - amount, _ => type)
        dispatch(removeFromReserve(countryName, armyName, types))
      }
    },
    [dispatch, type, reserve, countryName, armyName, weariness]
  )

  return <DelayedNumericInput value={count} type='number' onChange={updateReserve} />
}

const mapStateToProps = (state: AppState, props: Props) => {
  const { countryName, armyName } = props
  return {
    preferences: getUnitPreferences(state, countryName, armyName),
    reserve: getOverridenReserveDefinitions(state, countryName, armyName, true),
    units: getUnitDefinitions(state, countryName, armyName),
    culture: getCountry(state, countryName).culture,
    tech: getCountry(state, countryName)[CountryAttribute.TechLevel],
    settings: getSiteSettings(state),
    weariness: getCountry(state, countryName).weariness,
    mode: getMode(state)
  }
}

export default TableUnitTypes
