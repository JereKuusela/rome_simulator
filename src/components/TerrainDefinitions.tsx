import React, { Component } from 'react'
import { Table, Button, Image } from 'semantic-ui-react'
import { TerrainCalc, TerrainDefinition, TerrainType } from '../store/terrains'
import { getImage, calculateValue } from '../base_definition'
import ValueModal from './ValueModal'
import StyledNumber from './StyledNumber'
import { addSign } from '../formatters'
import { keys } from '../utils'
import { renderHeaders } from './utils'

interface IProps {
  readonly terrains: TerrainDefinition[]
  readonly onRowClick: (type: TerrainType) => void
  readonly onCreateNew: (type: TerrainType) => void
}

interface IState {
  open_create: boolean
}

// Display component for showing unit definitions for an army.
export default class TerrainDefinitions extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { open_create: false }
  }

  readonly attributes = keys(TerrainCalc).map(k => TerrainCalc[k])
  readonly headers = ['Terrain', 'Location', 'Roll']

  render() {
    return (
      <>
        <ValueModal
          open={this.state.open_create}
          onSuccess={this.props.onCreateNew}
          onClose={this.onClose}
          message='New terrain type'
          button_message='Create'
          initial={'' as TerrainType}
        />
        <Table celled selectable unstackable>
          {renderHeaders(this.headers)}
          <Table.Body>
            {this.props.terrains.map(this.renderRow)}
          </Table.Body>
        </Table>
        <Button primary onClick={this.onClick}>
          Create new
        </Button>
      </>
    )
  }

  onClick = () => this.setState({ open_create: true })
  onClose = () => this.setState({ open_create: false })

  renderRow = (terrain: TerrainDefinition) => {
    return (
      <Table.Row key={terrain.type} onClick={() => this.props.onRowClick(terrain.type)}>
        <Table.Cell>
          <Image src={getImage(terrain)} avatar />
          {terrain.type}
        </Table.Cell>
        <Table.Cell>
          {terrain.location}
        </Table.Cell>
        {this.renderAttributes(terrain)}
      </Table.Row>
    )
  }

  renderAttributes = (terrain: TerrainDefinition) => (
    this.attributes.map(type => (
      <Table.Cell key={type}>
        <StyledNumber value={calculateValue(terrain, type)} formatter={addSign} hide_zero />
      </Table.Cell>
    ))
  )
}
