import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import { Side, UnitRole, CountryName, UnitType, UnitAttribute, filterAttributes, Setting, Unit, Mode } from 'types'
import { getImage, mapRange } from 'utils'
import { AppState, getUnitPreferences, getCountry, getMode, getCombatParticipant, getArmyDefinitionWithOverriddenUnits, getSiteSettings } from 'state'
import { addToReserve, removeFromReserve, invalidate, setUnitPreference } from 'reducers'
import { getArchetypes2, getActualUnits2, getLatestUnits2, getChildUnits2 } from 'managers/army'
import UnitValueInput from './UnitValueInput'
import AttributeImage from 'components/Utils/AttributeImage'
import { getNextId } from 'army_utils'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { applyLosses } from 'managers/units'
import DropdownArchetype from 'components/Dropdowns/DropdownArchetype'

type Props = {
  side: Side
  country: CountryName
  onRowClick: (country: CountryName, type: UnitType) => void
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
      return [UnitAttribute.CombatAbility, UnitAttribute.OffensiveSupport]
    else {
      if (mode === Mode.Naval)
        return [UnitAttribute.Discipline, UnitAttribute.Morale, UnitAttribute.DamageDone, UnitAttribute.DamageTaken]
      return [UnitAttribute.Discipline, UnitAttribute.Morale, UnitAttribute.Offense, UnitAttribute.Defense]
    }
  }

  checkPreference = (role: UnitRole) => {
    const { units, preferences, tech, country } = this.props
    const preference = preferences[role]
    const tech_requirement = preference && units[preference] && units[preference].tech
    if (tech_requirement && tech_requirement > tech) {
      setUnitPreference(country, role, null) && invalidate()
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
      <Table celled unstackable key={side}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              {side}
            </Table.HeaderCell>
            {
              settings[Setting.Tech] &&
              <Table.HeaderCell>
                Type
              </Table.HeaderCell>
            }
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
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {!settings[Setting.Tech] && unit_list.map(this.renderUnitRow)}
          {settings[Setting.Tech] && this.renderRoleRow(UnitRole.Front, unit_list)}
          {settings[Setting.Tech] && this.renderRoleRow(UnitRole.Flank, unit_list)}
          {settings[Setting.Tech] && this.renderRoleRow(UnitRole.Support, unit_list)}
        </Table.Body>
      </Table>
    )
  }

  renderRoleRow = (role: UnitRole, archetypes: Unit[]) => {
    // List of archetypes -> get archetype -> get image
    const { units, setUnitPreference, country, invalidate, preferences, tech, settings, onRowClick } = this.props
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
          <Table.Cell onClick={() => onRowClick(country, archetype.type)} selectable>
            <Image src={image} avatar />
            {archetype.type}
          </Table.Cell>
          <Table.Cell>
            <DropdownArchetype
              value={preference}
              values={children}
              onSelect={type => setUnitPreference(country, role, type) && invalidate()}
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
        </Table.Row>
      </>
    )
  }

  renderUnitRow = (unit: Unit) => {
    const { country, settings, onRowClick } = this.props
    if (!unit)
      return null
    const image = getImage(unit)
    return (
      <Table.Row key={unit.type}>
        <Table.Cell onClick={() => onRowClick(country, unit.type)} selectable>
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

  renderCohortCount = (type: UnitType) => {
    const { reserve } = this.props
    const count = reserve.filter(cohort => cohort.type === type).length
    return (
      <DelayedNumericInput value={count} type='number' onChange={value => this.updateReserve(type, value)} />
    )
  }

  updateReserve = (type: UnitType, amount: number) => {
    const { country, addToReserve, removeFromReserve, invalidate, reserve, weariness } = this.props
    const previous = reserve.filter(cohort => cohort.type === type).length
    if (amount > previous) {
      const units = mapRange(amount - previous, _ => ({ id: getNextId(), type, image: '' }))
      addToReserve(country, applyLosses(weariness, units))
      invalidate()
    }
    if (amount < previous) {
      const types = mapRange(previous - amount, _ => type)
      removeFromReserve(country, types)
      invalidate()
    }
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  preferences: getUnitPreferences(state, props.side),
  reserve: getArmyDefinitionWithOverriddenUnits(state, props.country, true).reserve,
  units: getCombatParticipant(state, props.side).definitions,
  tech: getCountry(state, props.country).tech_level,
  settings: getSiteSettings(state),
  weariness: getCountry(state, props.country).weariness,
  mode: getMode(state)
})

const actions = { addToReserve, removeFromReserve, invalidate, setUnitPreference }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableUnitTypes)
