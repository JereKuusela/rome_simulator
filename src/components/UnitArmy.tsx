import React, { Component } from 'react'
import { List } from 'immutable'
import { Table, Image, Icon } from 'semantic-ui-react'
import { UnitDefinition, UnitCalc, ArmyType } from '../store/units'
import { calculateValue, calculateValueWithoutLoss, getImage } from '../base_definition'


interface IProps {
  units: List<UnitDefinition | undefined>
  reverse: boolean
  onClick: (index: number, unit: UnitDefinition | undefined) => void
  type: ArmyType
}

const MORALE_COLOR = 'rgba(200,55,55,0.60)'
const MANPOWER_COLOR = 'rgba(0,0,0,0.90)'
const WHITE_COLOR = 'rgba(255,255,255,0)'

// Display component for showing unit definitions for an army.
export default class UnitArmy extends Component<IProps> {

  readonly ROW_LENGTH = 30.0

  render() {
    const row_count = Math.ceil((this.props.units.size + (this.props.type === ArmyType.Main ? 0 : 1)) / this.ROW_LENGTH)
    const rows = Array(row_count).fill(0).map((_, index) => index)
    const columns = Array(this.ROW_LENGTH).fill(0).map((_, index) => index)
    return (
      <Table compact celled definition unstackable>
        <Table.Body>
          {
            rows.map(row => (
              <Table.Row key={row}>
                <Table.Cell>
                  <Icon fitted size='small' name={this.getIcon()}></Icon>
                </Table.Cell>
                {
                  columns.map(column => {
                    const unit = this.props.units.get(row * this.ROW_LENGTH + column)
                    return (
                      <Table.Cell key={column} selectable onClick={() => this.props.onClick(row * this.ROW_LENGTH + column, unit)}>
                        {
                          <div style={{ background: this.gradient(unit, MANPOWER_COLOR, UnitCalc.Manpower) }}>
                            <div style={{ background: this.gradient(unit, MORALE_COLOR, UnitCalc.Morale) }}>
                              <Image src={getImage(unit)} avatar />
                            </div>
                          </div>
                        }
                      </Table.Cell>
                    )
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
    )
  }

  getIcon = () => {
    if (this.props.type === ArmyType.Main)
      return this.props.reverse ? 'arrow down' : 'arrow up'
    if (this.props.type === ArmyType.Reserve)
      return 'home'
    if (this.props.type === ArmyType.Defeated)
      return 'heartbeat'
    return 'square full'
  }

  gradient = (unit: UnitDefinition | undefined, color: string, attribute: UnitCalc): string => {
    return 'linear-gradient(0deg, ' + color + ' 0%, ' + color + ' ' + this.percent(unit, attribute) + '%, ' + WHITE_COLOR + ' ' + this.percent(unit, attribute) + '%, ' + WHITE_COLOR + ' 100%)'
  }

  percent = (unit: UnitDefinition | undefined, attribute: UnitCalc): number => {
    if (!unit)
      return 0
    return 100.0 - 100.0 * calculateValue(unit, attribute) / calculateValueWithoutLoss(unit, attribute)
  }
}
