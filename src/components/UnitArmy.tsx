import React, { Component } from 'react'
import { List } from 'immutable'
import { ParticipantType, ArmyType } from '../store/battle'
import { Table, Image, Icon } from 'semantic-ui-react'
import { Unit, UnitCalc } from '../store/units'
import { calculateValue, calculateValueWithoutLoss, getImage } from '../base_definition'
import IconDefeated from '../images/attrition.png'


interface IProps {
  side: ParticipantType
  units?: List< Unit | undefined>
  row_width: number
  reverse: boolean
  onClick?: (index: number, unit: Unit | undefined) => void
  onRemove?: (index: number) => void
  type: ArmyType
  color: string
}

const MORALE_COLOR = 'rgba(200,55,55,0.60)'
const MANPOWER_COLOR = 'rgba(0,0,0,0.90)'
const WHITE_COLOR = 'rgba(255,255,255,0)'

// Display component for showing unit definitions for an army.
export default class UnitArmy extends Component<IProps> {
  render(): JSX.Element {
    const width = this.props.units ? this.props.units.size : 0
    const row_count = Math.ceil(width / this.props.row_width)
    const rows = Array(row_count).fill(0).map((_, index) => index)
    const columns = Array(this.props.row_width)
    const delta = Math.max(0, this.props.row_width - width)
    const low_limit = Math.ceil(delta / 2.0)
    const up_limit = this.props.row_width - Math.floor(delta / 2.0)
    for (let i = 0; i < this.props.row_width; i++) {
      columns[i] = i - low_limit
      if (i < low_limit)
        columns[i] = -1
      if (i >= up_limit)
        columns[i] = -1
    }
    return (
      <Table compact celled definition unstackable>
        <Table.Body>
          {
            rows.map(row => (
              <Table.Row key={row} textAlign='center'>
                <Table.Cell>
                  <Icon fitted size='small' name={this.getIcon()} style={{color: this.props.color}}></Icon>
                </Table.Cell>
                {
                  columns.map((column, index) => {
                    const unit = column > -1 && this.props.units ? this.props.units.get(row * this.props.row_width + column) : undefined
                    return (
                      <Table.Cell
                      className={this.props.side + '-' + this.props.type + '-' + column}
                      textAlign='center'
                      key={index}
                      disabled={column < 0}
                      selectable={!!this.props.onClick}
                      style={{backgroundColor: column < 0 ? '#DDDDDD' : 'white', padding: 0}}
                      onClick={() => this.props.onClick && this.props.onClick(row * this.props.row_width + column, unit)}
                      onContextMenu={(e: any) => e.preventDefault() || (this.props.onRemove && this.props.onRemove(row * this.props.row_width + column))}
                      >
                        {
                          <div style={{ background: this.gradient(unit, MANPOWER_COLOR, UnitCalc.Strength) }}>
                            <div style={{ background: this.gradient(unit, MORALE_COLOR, UnitCalc.Morale) }}>
                              <Image src={unit && unit.is_defeated ? IconDefeated : getImage(unit)} avatar style={{margin: 0}}/>
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
    if (this.props.type === ArmyType.Frontline)
      return this.props.reverse ? 'arrow down' : 'arrow up'
    if (this.props.type === ArmyType.Reserve)
      return 'home'
    if (this.props.type === ArmyType.Defeated)
      return 'heartbeat'
    return 'square full'
  }

  gradient = (unit: Unit | undefined, color: string, attribute: UnitCalc): string => {
    return 'linear-gradient(0deg, ' + color + ' 0%, ' + color + ' ' + this.percent(unit, attribute) + '%, ' + WHITE_COLOR + ' ' + this.percent(unit, attribute) + '%, ' + WHITE_COLOR + ' 100%)'
  }

  percent = (unit: Unit | undefined, attribute: UnitCalc): number => {
    if (!unit || unit.is_defeated)
      return 0
    return 100.0 - 100.0 * calculateValue(unit, attribute) / calculateValueWithoutLoss(unit, attribute)
  }
}
