import { OrderedMap } from 'immutable'
import React, { Component } from 'react'
import { Table, Button, Image } from 'semantic-ui-react'
import { TerrainCalc, TerrainDefinition, TerrainType } from '../store/terrains'
import { valueToRelativeNumber, getImage, calculateValue } from '../base_definition'
import ValueModal from './ValueModal'
import StyledNumber from './StyledNumber'
import { addSign } from '../formatters'

interface IProps {
  readonly terrains: OrderedMap<TerrainType, TerrainDefinition>
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

  readonly attributes = Object.keys(TerrainCalc).map(k => TerrainCalc[k as any]) as TerrainCalc[]
  readonly headers = ['Terrain', 'Location', 'Roll']

  render(): JSX.Element {
    return (
      <div>
        <ValueModal
          open={this.state.open_create}
          onSuccess={this.props.onCreateNew}
          onClose={this.onClose}
          message='New terrain type'
          button_message='Create'
          initial={'' as TerrainType}
        />
        <Table celled selectable unstackable>
          <Table.Header>
            <Table.Row>
              {
                Array.from(this.headers).map((value) => (
                  <Table.HeaderCell key={value}>
                    {value}
                  </Table.HeaderCell>
                ))
              }
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              this.props.terrains.map(this.renderRow).toList()
            }
          </Table.Body>
        </Table>
        <Button primary onClick={() => this.setState({ open_create: true })}>
          Create new
        </Button>
      </div>
    )
  }
  onClose = (): void => this.setState({ open_create: false })

  renderRow = (terrain?: TerrainDefinition): JSX.Element | null => {
    if (!terrain)
      return null
    return (
      <Table.Row key={terrain.type} onClick={() => this.props.onRowClick(terrain.type)}>
        <Table.Cell>
        <Image src={getImage(terrain)} avatar />
          {terrain.type}
        </Table.Cell>
        <Table.Cell>
          {terrain.location}
        </Table.Cell>
        {
          this.attributes.map(type => (
            <Table.Cell key={type}>
              <StyledNumber value={calculateValue(terrain, type)} formatter={addSign} hide_zero />
            </Table.Cell>
          ))
        }
      </Table.Row>
    )
  }
}
