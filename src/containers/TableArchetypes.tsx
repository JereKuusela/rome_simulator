import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import { Side, UnitRole, CountryName, UnitType, UnitAttribute, filterAttributes } from 'types'
import { getImage, mapRange } from 'utils'
import { AppState, getUnits, getUnitPreferences, getCountry, getArchetypes, getSettings, getCohorts } from 'state'
import { addToReserve, removeFromReserve, invalidate, setUnitPreference } from 'reducers'
import { getChildUnits } from 'managers/army'
import Dropdown from 'components/Utils/Dropdown'
import UnitValueInput from './UnitValueInput'
import AttributeImage from 'components/Utils/AttributeImage'
import { getNextId } from 'army_utils'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { applyLosses } from 'managers/units'

type Props = {
  side: Side
  country: CountryName
}

class TableArchetypes extends Component<IProps> {

  attributes = [UnitAttribute.CombatAbility, UnitAttribute.OffensiveSupport]

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
    const { side, settings } = this.props
    return (
      <Table celled selectable unstackable key={side}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              {side}
            </Table.HeaderCell>
            <Table.HeaderCell>
              Type
            </Table.HeaderCell>
            <Table.HeaderCell>
              Amount
            </Table.HeaderCell>
            {
              filterAttributes(this.attributes, settings).map(attribute => (
                <Table.HeaderCell key={attribute}>
                  <AttributeImage attribute={attribute} />
                </Table.HeaderCell>
              ))
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.renderRow(UnitRole.Front)}
          {this.renderRow(UnitRole.Flank)}
          {this.renderRow(UnitRole.Support)}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (role: UnitRole) => {
    // List of archetypes -> get archetype -> get image
    const { archetypes, units, setUnitPreference, country, invalidate, preferences, tech, settings } = this.props
    const archetype = archetypes.find(unit => unit.role === role)
    const preference = preferences[role]
    if (!archetype || !preference)
      return null
    const image = getImage(archetype)
    const types = getChildUnits(units, tech, archetype.type).map(unit => unit.type)
    return (
      <Table.Row>
        <Table.Cell>
          <Image src={image} avatar />
          {archetype.type}
        </Table.Cell>
        <Table.Cell>
          <Dropdown values={[UnitType.Latest].concat(types)} value={preference} onChange={type => setUnitPreference(country, role, type) && invalidate()} />
        </Table.Cell>
        <Table.Cell>
          {this.renderCohortCount(archetype.type)}
        </Table.Cell>
        {
          filterAttributes(this.attributes, settings).map(attribute => (
            <Table.Cell key={attribute}>
              <UnitValueInput unit={archetype} attribute={attribute} country={country} percent />
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
      <DelayedNumericInput value={count} onChange={value => this.updateReserve(type, value)} />
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
  archetypes: getArchetypes(state, props.country),
  preferences: getUnitPreferences(state, props.side),
  reserve: getCohorts(state, props.side, true).reserve,
  units: getUnits(state, props.country),
  tech: getCountry(state, props.side).tech_level,
  settings: getSettings(state),
  weariness: getCountry(state, props.side).weariness
})

const actions = { addToReserve, removeFromReserve, invalidate, setUnitPreference }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableArchetypes)
