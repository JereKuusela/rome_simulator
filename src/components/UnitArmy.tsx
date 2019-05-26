import React, { Component } from 'react'
import { List } from 'immutable'
import { Table, Image, Icon } from 'semantic-ui-react'
import { UnitDefinition, UnitCalc } from '../store/units'
import IconEmpty from '../images/empty.png'


interface IProps {
  units: List<List<(UnitDefinition | null)>>
  reverse: boolean
  onClick: (row: number, column: number, unit: UnitDefinition | null) => void
  row_names: boolean
}

const MORALE_COLOR = 'rgba(200,55,55,0.60)'
const MANPOWER_COLOR = 'rgba(0,0,0,0.90)'
const WHITE_COLOR = 'rgba(255,255,255,0)'

// Display component for showing unit definitions for an army.
export default class UnitArmy extends Component<IProps> {

  render() {
    return (
      <Table compact celled definition unstackable>
        <Table.Body>
          {
            (this.props.reverse ? this.props.units.reverse() : this.props.units).map((row, index) => this.renderRow(this.props.reverse ? this.props.units.size - 1 - index : index, row))
          }
        </Table.Body>
      </Table>
    )
  }


  renderRow = (row: number, units: List<(UnitDefinition | null)>) => {
    return (
      <Table.Row key={row}>
        <Table.Cell>
          <Icon fitted size='small' name={this.props.row_names ? this.props.reverse ? 'arrow down' : 'arrow up' : 'heartbeat'}></Icon>
        </Table.Cell>
        {
          units.map((unit, index) => (
            <Table.Cell key={index} selectable onClick={() => this.props.onClick(row, index, unit)}>
              {
                <div style={{ background: this.gradient(unit, MANPOWER_COLOR, UnitCalc.Manpower) }}>
                  <div style={{ background: this.gradient(unit, MORALE_COLOR, UnitCalc.Morale) }}>
                    <Image src={unit === null ? IconEmpty : unit.image} avatar />
                  </div>
                </div>
              }
            </Table.Cell>
          ))
        }
      </Table.Row>
    )
  }

  gradient = (unit: UnitDefinition | null, color: string, attribute: UnitCalc): string => {
    return 'linear-gradient(0deg, ' + color + ' 0%, ' + color + ' ' + this.percent(unit, attribute) + '%, ' + WHITE_COLOR + ' ' + this.percent(unit, attribute) + '%, ' + WHITE_COLOR + ' 100%)'
  }

  percent = (unit: UnitDefinition | null, attribute: UnitCalc): number => {
    if (!unit)
      return 0
    return 100.0 - 100.0 * unit.calculateValue(attribute) / unit.calculateValueWithoutLoss(attribute)
  }
}
