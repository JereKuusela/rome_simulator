import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Input } from 'semantic-ui-react'

import { AppState, getUnitPreferences, getFlankSize, getMode, getUnitList, getSiteSettings, getParticipant } from 'state'
import { setFlankSize, setUnitPreference } from 'reducers'

import { UnitPreferenceType, SideType, UnitType, Unit } from 'types'
import DropdownUnit from 'components/Dropdowns/DropdownUnit'
import { getUnitIcon } from 'data'

/**
 * Table with row types and flank sizes.
 */
export default class PreferredUnitTypes extends Component {
  render() {
    return (
      <Table celled unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              Preferred unit types
            </Table.HeaderCell>
            <Table.HeaderCell>
              {UnitPreferenceType.Primary}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {UnitPreferenceType.Secondary}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {UnitPreferenceType.Flank}
            </Table.HeaderCell>
            <Table.HeaderCell>
              Flank size
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <ConnectedRow side={SideType.Attacker} />
          <ConnectedRow side={SideType.Defender} />
        </Table.Body>
      </Table>
    )
  }
}

type Props = {
  side: SideType
}

/**
 * Row types and flank size for a side.
 */
class Row extends Component<IProps> {

  render() {
    const { side } = this.props
    return (
      <Table.Row key={side}>
        <Table.Cell>
          {side}
        </Table.Cell>
        {this.renderCell(UnitPreferenceType.Primary)}
        {this.renderCell(UnitPreferenceType.Secondary)}
        {this.renderCell(UnitPreferenceType.Flank)}
        {this.renderFlankSize()}
      </Table.Row>
    )
  }

  renderCell = (type: UnitPreferenceType) => {
    const { units, preferences, settings } = this.props
    const unit = preferences[type]
    const empty = { type: UnitType.None, image: getUnitIcon(UnitType.None) } as Unit
    return (
      <Table.Cell selectable onClick={() => this.setState({ modal_type: type })}>
        <DropdownUnit value={unit ?? UnitType.None} values={[empty].concat(units)}
          onSelect={unit_type => this.setUnitPreference(type, unit_type)}
          settings={settings}
        />
      </Table.Cell>
    )
  }

  renderFlankSize = () => {
    const { flank_size } = this.props
    return (
      <Table.Cell collapsing>
        <Input size='mini' style={{ width: 100 }} type='number' value={flank_size} onChange={(_, data) => this.setFlankSize(Number(data.value))} />
      </Table.Cell>
    )
  }

  setFlankSize = (value: number) => {
    const { setFlankSize, army, country } = this.props
    setFlankSize(country, army, value)
  }

  setUnitPreference = (type: UnitPreferenceType, unit_type: UnitType): void => {
    const { setUnitPreference, army, country } = this.props
    setUnitPreference(country, army, type, unit_type)
  }
}


const mapStateToProps = (state: AppState, props: Props) => {
  const participant = getParticipant(state, props.side)
  return {
    units: getUnitList(state, true, participant.country, participant.army),
    country: participant.country,
    army: participant.army,
    flank_size: getFlankSize(state, props.side),
    preferences: getUnitPreferences(state, props.side),
    mode: getMode(state),
    settings: getSiteSettings(state)
  }
}

const actions = { setFlankSize, setUnitPreference }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

const ConnectedRow = connect(mapStateToProps, actions)(Row)
