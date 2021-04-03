import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Input } from 'semantic-ui-react'

import type { AppState } from 'reducers'
import { setFlankSize, setUnitPreference } from 'reducers'
import { getUnitIcon } from 'data'
import { UnitPreferenceType, SideType, UnitType, UnitDefinition } from 'types'
import DropdownUnit from 'components/Dropdowns/DropdownUnit'
import { getMode, getCombatSettings, getParticipant, getUnitList, getFlankSize, getUnitPreferences } from 'selectors'

/**Table with row types and flank sizes. */
export default class PreferredUnitTypes extends Component {
  render() {
    return (
      <Table celled unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Preferred unit types</Table.HeaderCell>
            <Table.HeaderCell>{UnitPreferenceType.Primary}</Table.HeaderCell>
            <Table.HeaderCell>{UnitPreferenceType.Secondary}</Table.HeaderCell>
            <Table.HeaderCell>{UnitPreferenceType.Flank}</Table.HeaderCell>
            <Table.HeaderCell>Flank size</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <ConnectedRow side={SideType.A} />
          <ConnectedRow side={SideType.B} />
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
        <Table.Cell>{side}</Table.Cell>
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
    const empty = { type: UnitType.None, image: getUnitIcon(UnitType.None) } as UnitDefinition
    return (
      <Table.Cell selectable onClick={() => this.setState({ modalType: type })}>
        <DropdownUnit
          value={unit ?? UnitType.None}
          values={[empty].concat(units)}
          onSelect={unitType => this.setUnitPreference(type, unitType)}
          settings={settings}
        />
      </Table.Cell>
    )
  }

  renderFlankSize = () => {
    const { flankSize } = this.props
    return (
      <Table.Cell collapsing>
        <Input
          size='mini'
          style={{ width: 100 }}
          type='number'
          value={flankSize}
          onChange={(_, data) => this.setFlankSize(Number(data.value))}
        />
      </Table.Cell>
    )
  }

  setFlankSize = (value: number) => {
    const { setFlankSize, armyName, countryName } = this.props
    setFlankSize(countryName, armyName, value)
  }

  setUnitPreference = (type: UnitPreferenceType, unitType: UnitType): void => {
    const { setUnitPreference, armyName, countryName } = this.props
    setUnitPreference(countryName, armyName, type, unitType)
  }
}

const mapStateToProps = (state: AppState, props: Props) => {
  const participant = getParticipant(state, props.side, state.ui.selectedParticipantIndex[props.side])
  const { countryName, armyName } = participant
  return {
    units: getUnitList(state, true, countryName, armyName),
    countryName,
    armyName,
    flankSize: getFlankSize(state, countryName, armyName),
    preferences: getUnitPreferences(state, countryName, armyName),
    mode: getMode(state),
    settings: getCombatSettings(state)
  }
}

const actions = { setFlankSize, setUnitPreference }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

const ConnectedRow = connect(mapStateToProps, actions)(Row)
