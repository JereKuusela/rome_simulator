import { List as ImmutableList } from 'immutable'
import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { TerrainCalc, TerrainDefinition, TerrainType } from '../store/terrains'
import { valueToRelativeNumber} from '../base_definition'

interface IProps {
  readonly terrains: ImmutableList<TerrainDefinition>
  readonly onRowClick: (terrain: TerrainType) => void
}

// Display component for showing unit definitions for an army.
export default class TerrainDefinitions extends Component<IProps> {

  readonly attributes = Object.keys(TerrainCalc).map(k => TerrainCalc[k as any]) as TerrainCalc[]
  readonly headers = ['Terrain', 'Location', 'Roll']

  render() {
    return (
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
            this.props.terrains.map(value => this.renderRow(value))
          }
        </Table.Body>
      </Table>
    )
  }


  renderRow = (terrain: TerrainDefinition) => {

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
