import { List as ImmutableList } from 'immutable'
import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { TerrainCalc, TerrainDefinition, TerrainType } from '../store/terrains';

interface IProps {
  readonly terrains: ImmutableList<TerrainDefinition>
  readonly onRowClick: (terrain: TerrainType) => void
}

// Display component for showing unit definitions for an army.
export class TableTerrainDefinitions extends Component<IProps> {

  readonly attributes = Object.keys(TerrainCalc).map(k => TerrainCalc[k as any]) as TerrainCalc[]

  render() {
    return (
      <Table celled selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
            </Table.HeaderCell>
            <Table.HeaderCell>
              Roll
            </Table.HeaderCell>
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
        {
          this.attributes.map(type => (
            <Table.Cell key={type}>
              {terrain.valueToString(type)}
            </Table.Cell>
          ))
        }
      </Table.Row>
    )
  }
}
