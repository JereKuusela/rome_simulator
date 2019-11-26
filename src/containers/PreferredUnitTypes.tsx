import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table, Input } from 'semantic-ui-react'

import { AppState } from '../store/'
import { getCountry, getRowTypes, getUnitDefinitions, getFlankSize, getMode } from '../store/utils'
import { Side, RowType, setFlankSize } from '../store/battle'

import { getImage } from '../base_definition'

import ModalRowTypeSelector from './modal/ModalRowTypeSelector'

type Props = {
  side: Side
}

type IState = {
  modal_type?: RowType
}

// Shows row types and flank size for a side.
class PreferredUnitTypes extends Component<IProps, IState> {
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
  units: getUnitDefinitions(state, props.side),
  country: getCountry(state, props.side),
  flank_size: getFlankSize(state, props.side),
  row_types: getRowTypes(state, props.side),
  mode: getMode(state)
})

const actions = { setFlankSize }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(PreferredUnitTypes)
