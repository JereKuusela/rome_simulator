import React, { useCallback, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
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
  ArmyName,
  CultureType,
  CountryAttribute
} from 'types'
import { getImage, mapRange } from 'utils'
import { addToReserve, removeFromReserve, setUnitPreference, selectCulture } from 'reducers'
import { getArchetypes, getActualUnits, getLatestUnits, getChildUnits, getRootUnit } from 'managers/army'
import UnitValueInput from './UnitValueInput'
import AttributeImage from 'components/Utils/AttributeImage'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { applyLosses } from 'managers/units'
import DropdownArchetype from 'components/Dropdowns/DropdownArchetype'
import { getCultures } from 'data'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import {
  useMode,
  useCombatSettings,
  useWeariness,
  useCulture,
  useArmyData,
  useCountryAttribute,
  useUnitDefinitions
} from 'selectors'

type Props = {
  side: SideType
  countryName: CountryName
  armyName: ArmyName
  onRowClick: (country: CountryName, army: ArmyName, type: UnitType) => void
}

interface Name {
  countryName: CountryName
  armyName: ArmyName
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

const TableUnitTypes = (props: Props): JSX.Element | null => {
  const { countryName, armyName, side } = props
  const dispatch = useDispatch()
  const units = useUnitDefinitions(countryName, armyName)
  const settings = useCombatSettings()
  const mode = useMode()
  const preferences = useArmyData(countryName, armyName).unitPreferences
  const techLevel = useCountryAttribute(countryName, CountryAttribute.MartialTech)

  const checkPreference = useCallback(
    (role: UnitRole) => {
      if (!units) return
      const preference = preferences[role]
      const techRequirement = preference && units[preference] && units[preference]?.tech
      if (techRequirement && techRequirement > techLevel) {
        dispatch(setUnitPreference(countryName, armyName, role, null))
      }
    },
    [dispatch, preferences, countryName, armyName, techLevel, units]
  )

  useEffect(() => {
    checkPreference(UnitRole.Front)
    checkPreference(UnitRole.Flank)
    checkPreference(UnitRole.Support)
  }, [checkPreference])

  if (!units) return null

  const unitList = settings[Setting.Tech] ? getArchetypes(units, mode) : getActualUnits(units, mode)
  const rootUnit = getRootUnit(units, mode)
  if (!rootUnit) return null
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
        <RootUnitRow unit={rootUnit} {...props} />
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
  const settings = useCombatSettings()
  const mode = useMode()
  const culture = useCulture(countryName)
  const dispatch = useDispatch()

  const handleRowCLick = useCallback(() => onRowClick(countryName, armyName, unit.type), [
    onRowClick,
    unit.type,
    countryName,
    armyName
  ])

  const onSelectCulture = useCallback(
    (culture: CultureType) => {
      dispatch(selectCulture(countryName, culture, false))
    },
    [dispatch, countryName]
  )

  const attributes = useMemo(() => {
    return filterAttributes(getAttributes(mode), settings)
  }, [mode, settings])

  const isCulture = settings[Setting.Culture]

  if (!unit) return null
  const image = getImage(unit)
  return (
    <Table.Row key={unit.type}>
      <Table.Cell onClick={handleRowCLick} selectable>
        <Image src={image} avatar />
        {isCulture ? <SimpleDropdown values={getCultures()} value={culture} onChange={onSelectCulture} /> : 'Army'}
      </Table.Cell>
      <Table.Cell />
      {attributes.map(attribute => (
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
  const units = useUnitDefinitions(countryName, armyName)
  const settings = useCombatSettings()
  const mode = useMode()
  const preferences = useArmyData(countryName, armyName).unitPreferences
  const techLevel = useCountryAttribute(countryName, CountryAttribute.MartialTech)

  // List of archetypes -> get archetype -> get image
  const archetype = archetypes.find(unit => unit.role === role)
  const preference = preferences[role]
  const children = useMemo(() => {
    if (!archetype || !units) return undefined
    const latestType = getLatestUnits(units, techLevel)
    const unit = units[latestType[role] || archetype.type]
    if (!unit) return undefined
    const latest = { ...unit, type: UnitType.Latest }
    return [latest].concat(...getChildUnits(units, techLevel, archetype.type))
  }, [archetype, units, role, techLevel])

  const handleRowCLick = useCallback(() => onRowClick(countryName, armyName, archetype?.type ?? ('' as UnitType)), [
    onRowClick,
    archetype?.type,
    countryName,
    armyName
  ])

  const handleSelect = useCallback(
    (type: UnitType) => {
      dispatch(setUnitPreference(countryName, armyName, role, type))
    },
    [dispatch, countryName, armyName, role]
  )

  const attributes = useMemo(() => {
    return filterAttributes(getAttributes(mode), settings)
  }, [mode, settings])

  if (!children || !archetype || !preference || !units) return null
  const image = getImage(archetype)

  return (
    <Table.Row key={role}>
      <Table.Cell onClick={handleRowCLick} selectable className='padding'>
        <Image src={image} avatar />
        <DropdownArchetype value={preference} values={children} onSelect={handleSelect} settings={settings} />
      </Table.Cell>
      <Table.Cell>
        <CohortCount type={archetype.type} armyName={armyName} countryName={countryName} />
      </Table.Cell>
      {attributes.map(attribute => (
        <Table.Cell key={attribute}>
          <UnitValueInput unit={archetype} attribute={attribute} country={countryName} percent />
        </Table.Cell>
      ))}
    </Table.Row>
  )
}

const UnitRow = (props: { unit: UnitDefinition } & Props) => {
  const { unit, countryName, armyName, onRowClick } = props
  const settings = useCombatSettings()
  const mode = useMode()

  const handleRowCLick = useCallback(() => onRowClick(countryName, armyName, unit.type), [
    onRowClick,
    countryName,
    armyName,
    unit.type
  ])

  const attributes = useMemo(() => {
    return filterAttributes(getAttributes(mode), settings)
  }, [mode, settings])
  if (!unit) return null
  const image = getImage(unit)
  return (
    <Table.Row key={unit.type}>
      <Table.Cell onClick={handleRowCLick} selectable>
        <Image src={image} avatar />
        {unit.type}
      </Table.Cell>
      <Table.Cell>
        <CohortCount type={unit.type} countryName={countryName} armyName={armyName} />
      </Table.Cell>
      {attributes.map(attribute => (
        <Table.Cell key={attribute}>
          <UnitValueInput unit={unit} attribute={attribute} country={countryName} percent />
        </Table.Cell>
      ))}
    </Table.Row>
  )
}

const CohortCount = (props: { type: UnitType } & Name) => {
  const dispatch = useDispatch()
  const { type, countryName, armyName } = props
  const reserve = useArmyData(countryName, armyName).reserve
  const weariness = useWeariness(countryName)
  const count = useMemo(() => reserve.filter(cohort => cohort.type === type).length, [reserve, type])

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

export default TableUnitTypes
