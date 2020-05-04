import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import { SideType, UnitRole, CountryName, UnitType, UnitAttribute, filterAttributes, Setting, Unit, Mode, CountryAttribute, ArmyName, isAttributeEnabled } from 'types'
import { getImage, mapRange } from 'utils'
import { AppState, getUnitPreferences, getCountry, getMode, getCombatParticipant, getArmyDefinitionWithOverriddenUnits, getSiteSettings } from 'state'
import { addToReserve, removeFromReserve, setUnitPreference } from 'reducers'
import { getArchetypes2, getActualUnits2, getLatestUnits2, getChildUnits2, getRootUnit } from 'managers/army'
import UnitValueInput from './UnitValueInput'
import AttributeImage from 'components/Utils/AttributeImage'
import { getNextId } from 'army_utils'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { applyLosses } from 'managers/units'
import DropdownArchetype from 'components/Dropdowns/DropdownArchetype'
import OverflowGuard from 'components/Utils/OverflowGuard'
import CountryValueInput from './CountryValueInput'

type Props = {
  side: SideType
  country: CountryName
  army: ArmyName
  onRowClick: (country: CountryName, army: ArmyName, type: UnitType) => void
}

class TableUnitTypes extends Component<IProps> {

  shouldComponentUpdate(nextProps: IProps) {
    if (this.props.preferences !== nextProps.preferences)
      return true
    return true
  }

  getAttributes = () => {
    const { mode } = this.props
    if (process.env.REACT_APP_GAME === 'euiv')
      return [UnitAttribute.Morale, UnitAttribute.Discipline, UnitAttribute.CombatAbility, UnitAttribute.OffensiveSupport]
    else {
      if (mode === Mode.Naval)
        return [UnitAttribute.Discipline, UnitAttribute.Morale, UnitAttribute.DamageDone, UnitAttribute.DamageTaken]
      return [UnitAttribute.Discipline, UnitAttribute.Morale, UnitAttribute.Offense, UnitAttribute.Defense]
    }
  }

  checkPreference = (role: UnitRole) => {
    const { units, preferences, tech, country, army } = this.props
    const preference = preferences[role]
    const tech_requirement = preference && units[preference] && units[preference].tech
    if (tech_requirement && tech_requirement > tech) {
      setUnitPreference(country, army, role, null)
    }
  }

  componentDidUpdate() {
    this.checkPreference(UnitRole.Front)
    this.checkPreference(UnitRole.Flank)
    this.checkPreference(UnitRole.Support)
  }

  render() {
    const { side, settings, units, mode } = this.props
    const unit_list = settings[Setting.Tech] ? getArchetypes2(units, mode) : getActualUnits2(units, mode)
    return (
      <OverflowGuard>
        <Table celled unstackable key={side} singleLine>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                {side}
              </Table.HeaderCell>
              <Table.HeaderCell>
                Amount
            </Table.HeaderCell>
              {
                filterAttributes(this.getAttributes(), settings).map(attribute => (
                  <Table.HeaderCell key={attribute}>
                    <AttributeImage attribute={attribute} settings={settings} />
                  </Table.HeaderCell>
                ))
              }
              {
                isAttributeEnabled(CountryAttribute.FlankRatio, settings) &&
                <Table.HeaderCell >
                  <AttributeImage attribute={CountryAttribute.FlankRatio} settings={settings} />
                </Table.HeaderCell>
              }
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.renderRootUnitRow(getRootUnit(units, mode))}
            {!settings[Setting.Tech] && unit_list.map(this.renderUnitRow)}
            {settings[Setting.Tech] && this.renderRoleRow(UnitRole.Front, unit_list)}
            {settings[Setting.Tech] && this.renderRoleRow(UnitRole.Flank, unit_list)}
            {settings[Setting.Tech] && this.renderRoleRow(UnitRole.Support, unit_list)}
          </Table.Body>
        </Table>
      </OverflowGuard>
    )
  }

  renderRoleRow = (role: UnitRole, archetypes: Unit[]) => {
    // List of archetypes -> get archetype -> get image
    const { units, setUnitPreference, country, army, preferences, tech, settings, onRowClick } = this.props
    const archetype = archetypes.find(unit => unit.role === role)
    const preference = preferences[role]
    if (!archetype || !preference)
      return null
    const image = getImage(archetype)
    const latest_type = getLatestUnits2(units, tech)
    const latest = { ...units[latest_type[role] || archetype.type], type: UnitType.Latest }
    const children = [latest].concat(...getChildUnits2(units, tech, archetype.type))
    return (
      <>
        <Table.Row key={role}>
          <Table.Cell onClick={() => onRowClick(country, army, archetype.type)} selectable>
            <Image src={image} avatar />
            <DropdownArchetype
              value={preference}
              values={children}
              onSelect={type => setUnitPreference(country, army, role, type)}
              settings={settings}
            />
          </Table.Cell>
          <Table.Cell>
            {this.renderCohortCount(archetype.type)}
          </Table.Cell>
          {
            filterAttributes(this.getAttributes(), settings).map(attribute => (
              <Table.Cell key={attribute}>
                <UnitValueInput unit={archetype} attribute={attribute} country={country} percent />
              </Table.Cell>
            ))
          }
          <Table.Cell />
        </Table.Row>
      </>
    )
  }

  renderUnitRow = (unit: Unit) => {
    const { country, settings, army, onRowClick } = this.props
    if (!unit)
      return null
    const image = getImage(unit)
    return (
      <Table.Row key={unit.type}>
        <Table.Cell onClick={() => onRowClick(country, army, unit.type)} selectable>
          <Image src={image} avatar />
          {unit.type}
        </Table.Cell>
        <Table.Cell>
          {this.renderCohortCount(unit.type)}
        </Table.Cell>
        {
          filterAttributes(this.getAttributes(), settings).map(attribute => (
            <Table.Cell key={attribute}>
              <UnitValueInput unit={unit} attribute={attribute} country={country} percent />
            </Table.Cell>
          ))
        }
      </Table.Row>
    )
  }

  renderRootUnitRow = (unit: Unit) => {
    const { country, settings, army, onRowClick } = this.props
    if (!unit)
      return null
    const image = getImage(unit)
    return (
      <Table.Row key={unit.type}>
        <Table.Cell onClick={() => onRowClick(country, army, unit.type)} selectable>
          <Image src={image} avatar />
          Army
        </Table.Cell>
        <Table.Cell />
        {
          filterAttributes(this.getAttributes(), settings).map(attribute => (
            <Table.Cell key={attribute}>
              <UnitValueInput unit={unit} attribute={attribute} country={country} percent />
            </Table.Cell>
          ))
        }
        {
          isAttributeEnabled(CountryAttribute.FlankRatio, settings) &&
          <Table.Cell>
            <CountryValueInput attribute={CountryAttribute.FlankRatio} country={country} percent />
          </Table.Cell>
        }
      </Table.Row>
    )
  }

  renderCohortCount = (type: UnitType) => {
    const { reserve } = this.props
    const count = reserve.filter(cohort => cohort.type === type).length
    return (
      <DelayedNumericInput value={count} type='number' onChange={value => this.updateReserve(type, value)} />
    )
  }

  updateReserve = (type: UnitType, amount: number) => {
    const { country, addToReserve, army, removeFromReserve, reserve, weariness } = this.props
    const previous = reserve.filter(cohort => cohort.type === type).length
    if (amount > previous) {
      const units = mapRange(amount - previous, _ => ({ id: getNextId(), type, image: '' }))
      addToReserve(country, army, applyLosses(weariness, units))
    }
    if (amount < previous) {
      const types = mapRange(previous - amount, _ => type)
      removeFromReserve(country, army, types)
    }
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  preferences: getUnitPreferences(state, props.side),
  reserve: getArmyDefinitionWithOverriddenUnits(state, props.country, props.army, true).reserve,
  units: getCombatParticipant(state, props.side).definitions,
  tech: getCountry(state, props.country)[CountryAttribute.TechLevel],
  settings: getSiteSettings(state),
  weariness: getCountry(state, props.country).weariness,
  mode: getMode(state)
})

const actions = { addToReserve, removeFromReserve, setUnitPreference }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableUnitTypes)
