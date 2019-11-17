import React, { Component } from 'react'

import { Side, ArmyType } from '../store/battle'
import { Table, Image, Icon } from 'semantic-ui-react'
import { getImage } from '../base_definition'

import CombatTooltip from '../containers/CombatTooltip'

import IconDefeated from '../images/attrition.png'

export type UnitArmyUnit = {
  id: number
  is_defeated: boolean
  image?: string
  max_morale: number
  max_strength: number
  morale: number
  strength: number
} | null

type IProps = {
  side: Side
  units: UnitArmyUnit[]
  row_width: number
  reverse: boolean
  onClick?: (index: number, id: number | undefined) => void
  onRemove?: (index: number) => void
  type: ArmyType
  color: string
  disable_add?: boolean
}

type IState = {
  tooltip_index: number | null
  tooltip_context: Element | null
}

const MORALE_COLOR = 'rgba(200,55,55,0.60)'
const MANPOWER_COLOR = 'rgba(0,0,0,0.90)'
const WHITE_COLOR = 'rgba(255,255,255,0)'

// Shows a part of an army (frontline, reserve or defeated).
export default class UnitArmy extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { tooltip_index: null, tooltip_context: null }
  }

  render() {
    const width = this.props.units.length
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
      <>
        <CombatTooltip index={this.state.tooltip_index} context={this.state.tooltip_context} side={this.props.side} />
        <Table compact celled definition unstackable>
          <Table.Body>
            {
              rows.map(row => (
                <Table.Row key={row} textAlign='center'>
                  <Table.Cell>
                    <Icon fitted size='small' name={this.getIcon()} style={{ color: this.props.color }}></Icon>
                  </Table.Cell>
                  {
                    columns.map((column, index) => {
                      const unit = column > -1 ? this.props.units[row * this.props.row_width + column] : null
                      return this.renderCell(row, index, column, unit)
                    })
                  }
                </Table.Row>
              ))
            }
          </Table.Body>
        </Table>
      </>
    )
  }

  renderCell = (row: number, index: number, column: number, unit: UnitArmyUnit) => {
    return (
      <Table.Cell
        className={this.props.side + '-' + this.props.type + '-' + unit?.id}
        textAlign='center'
        key={index}
        disabled={column < 0 || (this.props.disable_add && !unit)}
        selectable={!!this.props.onClick}
        style={{ backgroundColor: column < 0 ? '#DDDDDD' : 'white', padding: 0 }}
        onClick={() => this.props.onClick && this.props.onClick(row * this.props.row_width + column, unit?.id)}
        onMouseEnter={(e: React.MouseEvent) => unit && this.setState({ tooltip_index: unit.id, tooltip_context: e.currentTarget })}
        onMouseLeave={() => this.setState({ tooltip_index: null, tooltip_context: null })}
        onContextMenu={(e: any) => e.preventDefault() || (this.props.onRemove && this.props.onRemove(row * this.props.row_width + column))}
      >
        {this.renderUnit(unit)}
      </Table.Cell>
    )
  }

  renderUnit = (unit: UnitArmyUnit) => {
    if (!unit)
      return this.renderImage(getImage(null))
    if (unit.is_defeated)
      return this.renderImage(IconDefeated)
    return (
      <div style={{ background: this.gradient(MANPOWER_COLOR, unit.strength, unit.max_strength) }}>
        <div style={{ background: this.gradient(MORALE_COLOR, unit.morale, unit.max_morale) }}>
          {this.renderImage(getImage(unit))}
        </div>
      </div>
    )
  }

  renderImage = (image: string) => <Image src={image} avatar style={{ margin: 0 }} />

  getIcon = () => {
    if (this.props.type === ArmyType.Frontline)
      return this.props.reverse ? 'arrow down' : 'arrow up'
    if (this.props.type === ArmyType.Reserve)
      return 'home'
    if (this.props.type === ArmyType.Defeated)
      return 'heartbeat'
    return 'square full'
  }

  gradient = (color: string, current: number, max: number) => (
    'linear-gradient(0deg, ' + color + ' 0%, ' + color + ' ' + this.percent(current, max) + '%, ' + WHITE_COLOR + ' ' + this.percent(current, max) + '%, ' + WHITE_COLOR + ' 100%)'
  )

  percent = (current: number, max: number) => 100.0 - 100.0 * current / max
}
