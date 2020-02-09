import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table, Input } from 'semantic-ui-react'

import { AppState, getCountry, getUnitPreferences, getFlankSize, getMode, getUnitDefinitionsBySide } from 'state'
import { setFlankSize, invalidate } from 'reducers'

import ModalUnitPreferenceSelector from './modal/ModalUnitPreferenceSelector'
import { UnitPreferenceType, Side } from 'types'
import { getImage } from 'utils'

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
          <ConnectedRow side={Side.Attacker} />
          <ConnectedRow side={Side.Defender} />
        </Table.Body>
      </Table>
    )
  }
}

type Props = {
  side: Side
}

type IState = {
  modal_type?: UnitPreferenceType
}

/**
 * Row types and flank size for a side.
 */
class Row extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { modal_type: undefined }
  }

  render() {
    const { country, side } = this.props
    const { modal_type } = this.state
    return (
      <>
        <ModalUnitPreferenceSelector
          type={modal_type}
          country={country}
          onClose={this.closeModal}
        />
        <Table.Row key={side}>
          <Table.Cell>
            {side}
          </Table.Cell>
          {this.renderCell(UnitPreferenceType.Primary)}
          {this.renderCell(UnitPreferenceType.Secondary)}
          {this.renderCell(UnitPreferenceType.Flank)}
          {this.renderFlankSize()}
        </Table.Row>
      </>
    )
  }

  renderCell = (type: UnitPreferenceType) => {
    const { units, preferences } = this.props
    const unit = preferences[type]
    return (
      <Table.Cell selectable onClick={() => this.setState({ modal_type: type })}>
        <Image src={getImage(unit && units[unit])} avatar />
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
    const { setFlankSize, invalidate, country } = this.props
    setFlankSize(country, value)
    invalidate()
  }

  closeModal = () => {
    this.setState({ modal_type: undefined })
  }
}


const mapStateToProps = (state: AppState, props: Props) => ({
  units: getUnitDefinitionsBySide(state, props.side),
  country: getCountry(state, props.side),
  flank_size: getFlankSize(state, props.side),
  preferences: getUnitPreferences(state, props.side),
  mode: getMode(state)
})

const actions = { setFlankSize, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

const ConnectedRow = connect(mapStateToProps, actions)(Row)
