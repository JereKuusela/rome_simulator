import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Image, Icon } from 'semantic-ui-react'


import CombatTooltip from './CombatTooltip'
import IconDefeated from 'images/attrition.png'
import { Side, ArmyType, UnitAttribute } from 'types'
import { getImage } from 'utils'
import { CombatCohort } from 'combat'
import { AppState, getCurrentCombat, getCountryName } from 'state'
import { getArmyPart } from 'army_utils'
import { flatten } from 'lodash'
import { deleteCohort, invalidate } from 'reducers'

type Props = {
  side: Side
  row_width: number
  reverse: boolean
  onClick?: (row: number, column: number, id: number | undefined) => void
  type: ArmyType
  color: string
  // Prevents adding units.
  disable_add?: boolean
  // Renders full rows for a cleaner look.
  full_rows?: boolean
  // Can be used to guarantee that a new unit can always be added.
  extra_slot?: boolean
}

type IState = {
  tooltip_index: number | null
  tooltip_context: Element | null
  tooltip_is_support: boolean
}

const MORALE_COLOR = 'rgba(200,55,55,0.60)'
const MANPOWER_COLOR = 'rgba(0,0,0,0.90)'
const WHITE_COLOR = 'rgba(255,255,255,0)'

// Shows a part of an army (frontline, reserve or defeated).
class UnitArmy extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { tooltip_index: null, tooltip_context: null, tooltip_is_support: false }
  }

  render() {
    const { units, row_width, side, type, full_rows, extra_slot, reverse } = this.props
    const copy = reverse ? [...units].reverse() : units
    const flat_units = flatten(copy)
    const { tooltip_index, tooltip_context, tooltip_is_support } = this.state
    let width = flat_units.length
    if (extra_slot)
      width++
    if (full_rows)
      width = Math.ceil(width / row_width) * row_width
    const row_count = Math.ceil(width / row_width)
    const rows = Array(row_count).fill(0).map((_, index) => index)
    const columns = Array<number>(row_width)
    const delta = Math.max(0, row_width - width)
    const low_limit = Math.ceil(delta / 2.0)
    const up_limit = row_width - Math.floor(delta / 2.0)
    for (let i = 0; i < row_width; i++) {
      columns[i] = i - low_limit
      if (i < low_limit)
        columns[i] = -1
      if (i >= up_limit)
        columns[i] = -1
    }
    return (
      <>
        <CombatTooltip id={tooltip_index} context={tooltip_context} is_support={tooltip_is_support} side={side} army={type} />
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
                      const unit = column > -1 ? flat_units[row * row_width + column] : null
                      return this.renderCell(reverse ? rows.length - 1 - row : row, index, column, unit, reverse ? row < rows.length - 1 : row > 0)
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

  renderCell = (row: number, index: number, column: number, unit: ICohort, is_support: boolean) => {
    const { side, type, disable_add, onClick } = this.props
    return (
      <Table.Cell
        className={side + '-' + type + '-' + unit?.id}
        textAlign='center'
        key={index}
        disabled={column < 0 || (disable_add && !unit)}
        selectable={!!onClick}
        style={{ backgroundColor: column < 0 ? '#DDDDDD' : 'white', padding: 0 }}
        onClick={() => onClick && onClick(row, column, unit?.id)}
        onMouseOver={(e: React.MouseEvent) => unit && this.setState({ tooltip_index: unit.id, tooltip_context: e.currentTarget, tooltip_is_support: is_support })}
        onMouseLeave={() => unit && this.state.tooltip_index === unit.id && this.setState({ tooltip_index: null, tooltip_context: null })}
        onContextMenu={(e: any) => e.preventDefault() || this.deleteCohort(unit)}
      >
        {this.renderUnit(unit)}
      </Table.Cell>
    )
  }

  renderUnit = (unit: ICohort) => {
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
    const { type, reverse } = this.props
    if (type === ArmyType.Frontline)
      return reverse ? 'arrow down' : 'arrow up'
    if (type === ArmyType.Reserve)
      return 'home'
    if (type === ArmyType.Defeated)
      return 'heartbeat'
    return 'square full'
  }

  gradient = (color: string, current: number, max: number) => (
    'linear-gradient(0deg, ' + color + ' 0%, ' + color + ' ' + this.percent(current, max) + '%, ' + WHITE_COLOR + ' ' + this.percent(current, max) + '%, ' + WHITE_COLOR + ' 100%)'
  )

  percent = (current: number, max: number) => 100.0 - 100.0 * current / max

  deleteCohort = (cohort: ICohort) => {
    if (!cohort)
      return
    const { deleteCohort, invalidate, country } = this.props
    deleteCohort(country, cohort.id)
    invalidate()
  }
}

type ICohort = {
  id: number
  is_defeated: boolean
  image?: string
  max_morale: number
  max_strength: number
  morale: number
  strength: number
} | null

const convertUnits = (units: (CombatCohort | null)[][]): ICohort[][] => (
  units.map(row => row.map(unit => unit && {
    id: unit.definition.id,
    is_defeated: unit.state.is_defeated,
    image: unit.definition.image,
    morale: unit[UnitAttribute.Morale],
    max_morale: unit.definition.max_morale,
    strength: unit[UnitAttribute.Strength],
    max_strength: unit.definition.max_strength
  }))
)

const mapStateToProps = (state: AppState, props: Props) => ({
  units: convertUnits(getArmyPart(getCurrentCombat(state, props.side), props.type)),
  country: getCountryName(state, props.side)
})

const actions = { deleteCohort, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(UnitArmy)
