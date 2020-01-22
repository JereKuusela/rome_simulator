import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table, Input } from 'semantic-ui-react'

import { AppState } from '../store/'
import { getCountry, getRowTypes, getFlankSize, getMode, getUnitDefinitionsBySide } from '../store/utils'
import { setFlankSize } from 'reducers/battle'

import ModalRowTypeSelector from './modal/ModalRowTypeSelector'
import { RowType, Side } from 'types'
import { getImage } from 'base_definition'

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
              {RowType.Primary}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {RowType.Secondary}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {RowType.Flank}
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
  modal_type?: RowType
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
        <ModalRowTypeSelector
          type={modal_type}
          country={country}
          onClose={this.closeModal}
        />
        <Table.Row key={side}>
          <Table.Cell>
            {side}
          </Table.Cell>
          {this.renderCell(RowType.Primary)}
          {this.renderCell(RowType.Secondary)}
          {this.renderCell(RowType.Flank)}
          {this.renderFlankSize()}
        </Table.Row>
      </>
    )
  }

  renderCell = (row_type: RowType) => {
    const { units, row_types } = this.props
    const unit = row_types[row_type]
    return (
      <Table.Cell selectable onClick={() => this.setState({ modal_type: row_type })}>
        <Image src={getImage(unit && units[unit])} avatar />
      </Table.Cell>
    )
  }

  renderFlankSize = () => {
    const { flank_size, setFlankSize, mode, country } = this.props
    return (
      <Table.Cell collapsing>
        <Input size='mini' style={{ width: 100 }} type='number' value={flank_size} onChange={(_, data) => setFlankSize(mode, country, Number(data.value))} />
      </Table.Cell>
    )
  }

  closeModal = () => {
    this.setState({ modal_type: undefined })
  }
}


const mapStateToProps = (state: AppState, props: Props) => ({
  units: getUnitDefinitionsBySide(state, props.side),
  country: getCountry(state, props.side),
  flank_size: getFlankSize(state, props.side),
  row_types: getRowTypes(state, props.side),
  mode: getMode(state)
})

const actions = { setFlankSize }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

const ConnectedRow = connect(mapStateToProps, actions)(Row)
