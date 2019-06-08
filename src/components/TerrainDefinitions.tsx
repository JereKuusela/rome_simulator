import { OrderedSet, Map } from 'immutable'
import React, { Component } from 'react'
import { Table, Button } from 'semantic-ui-react'
import { TerrainCalc, TerrainDefinition, TerrainType } from '../store/terrains'
import { valueToRelativeNumber } from '../base_definition'
import NewDefinition from './NewDefinition'

interface IProps {
  readonly terrains: Map<TerrainType, TerrainDefinition>
  readonly types: OrderedSet<TerrainType>
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

  render() {
    return (
      <div>
        <NewDefinition
          open={this.state.open_create}
          onCreate={this.onCreate}
          onClose={this.onClose}
          message='New terrain type'
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
              this.props.types.map(value => this.renderRow(this.props.terrains.get(value)))
            }
          </Table.Body>
        </Table>
        <Button primary onClick={this.newOnClick}>
          Create new
        </Button>
      </div>
    )
  }

  newOnClick = () => this.setState({ open_create: true })

  onCreate = (type: string) => this.props.onCreateNew(type as TerrainType)

  onClose = () => this.setState({ open_create: false })

  renderRow = (terrain: TerrainDefinition | undefined) => {
    if (!terrain)
      return null
    return (
      <Table.Row key={terrain.type} onClick={() => this.props.onRowClick(terrain.type)}>
        <Table.Cell>
          {terrain.type}
        </Table.Cell>
        <Table.Cell>
          {terrain.location}
        </Table.Cell>
        {
          this.attributes.map(type => (
            <Table.Cell key={type}>
              {valueToRelativeNumber(terrain, type, false)}
            </Table.Cell>
          ))
        }
      </Table.Row>
    )
  }
}
