import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import { Side, UnitRole, CountryName, UnitType, UnitAttribute, filterAttributes } from 'types'
import { getImage } from 'utils'
import { AppState, getUnits, getUnitPreferences, getCountry, getArchetypes, getSettings } from 'state'
import { invalidate, setUnitPreference } from 'reducers'
import { getChildUnits } from 'managers/army'
import Dropdown from 'components/Utils/Dropdown'
import UnitValueInput from './UnitValueInput'
import AttributeImage from 'components/Utils/AttributeImage'

type Props = {
  side: Side
  country: CountryName
}

class TableArchetypes extends Component<IProps> {

  attributes = [UnitAttribute.CombatAbility, UnitAttribute.FireDamageDone, UnitAttribute.FireDamageTaken, UnitAttribute.ShockDamageDone, UnitAttribute.ShockDamageTaken]

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
            <Table.HeaderCell width='2'>
              {side}
            </Table.HeaderCell>
            <Table.HeaderCell width='2'>
              Type
            </Table.HeaderCell>
            {
              filterAttributes(this.attributes, settings).map(attribute => (
                <Table.HeaderCell width='2'>
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
        {
          filterAttributes(this.attributes, settings).map(attribute => (
            <Table.Cell>
              <UnitValueInput unit={archetype} attribute={attribute} country={country} percent />
            </Table.Cell>
          ))
        }
      </Table.Row>
    )
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  archetypes: getArchetypes(state, props.country),
  preferences: getUnitPreferences(state, props.side),
  units: getUnits(state, props.country),
  tech: getCountry(state, props.side).tech_level,
  settings: getSettings(state)
})

const actions = { invalidate, setUnitPreference }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableArchetypes)
