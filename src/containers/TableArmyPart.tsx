import React, { Component, PureComponent } from 'react'
import { connect } from 'react-redux'
import { Table, Image, Icon } from 'semantic-ui-react'


import CombatTooltip from './CombatTooltip'
import IconDefeated from 'images/attrition.png'
import { Side, ArmyType, UnitAttribute, CombatCohort } from 'types'
import { getImage, resize } from 'utils'
import { AppState, getCurrentCombat, getBattle, getParticipant } from 'state'
import { getArmyPart } from 'army_utils'
import { last } from 'lodash'
import { deleteCohort } from 'reducers'

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
class TableArmyPart extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { tooltip_index: null, tooltip_context: null, tooltip_is_support: false }
  }

  shouldComponentUpdate(prevProps: IProps, prevState: IState) {
    return prevProps.timestamp !== this.props.timestamp || prevState.tooltip_index !== this.state.tooltip_index
  }

  render() {
    const { row_width, side, type, full_rows, reverse } = this.props
    const { tooltip_index, tooltip_context, tooltip_is_support } = this.state
    let units = this.props.units
    let index_offset = 0
    if (full_rows) {
      units = units.map(arr => resize(arr, row_width, null))
      if (last(last(units)))
        units.push(Array(row_width).fill(null))

    } else {
      const filler = Math.max(0, row_width - units[0].length)
      const left_filler = index_offset = Math.ceil(filler / 2.0)
      const right_filler = Math.floor(filler / 2.0)
      units = units.map(row => Array(left_filler).fill(undefined).concat(row).concat(Array(right_filler).fill(undefined)))
    }
    if (reverse)
      units.reverse()
    return (
      <>
        <CombatTooltip id={tooltip_index} context={tooltip_context} is_support={tooltip_is_support} side={side} army={type} />
        <Table compact celled definition unstackable>
          <Table.Body>
            {
              units.map((row, row_index) => {
                row_index = reverse ? units.length - 1 - row_index : row_index
                return (
                  < Table.Row key={row_index} textAlign='center' >
                    <Table.Cell>
                      <Icon fitted size='small' name={this.getIcon()} style={{ color: this.props.color }}></Icon>
                    </Table.Cell>
                    {
                      row.map((cohort, index) => {
                        index = index - index_offset
                        return this.renderCell(row_index, index, cohort, row_index > 0)
                      })
                    }
                  </Table.Row>
                )
              })
            }
          </Table.Body>
        </Table>
      </>
    )
  }

  renderCell = (row: number, column: number, cohort: ICohort, is_support: boolean) => {
    const { side, type, disable_add, onClick } = this.props
    const filler = cohort === undefined
    return (
      <Table.Cell
        className={side + '-' + type + '-' + cohort?.id}
        textAlign='center'
        key={column}
        disabled={filler || (disable_add && !cohort)}
        selectable={!!onClick}
        style={{ backgroundColor: filler ? '#DDDDDD' : 'white', padding: 0 }}
        onClick={() => onClick && onClick(row, column, cohort?.id)}
        onMouseOver={(e: React.MouseEvent) => cohort && this.setState({ tooltip_index: cohort.id, tooltip_context: e.currentTarget, tooltip_is_support: is_support })}
        onMouseLeave={() => cohort && this.state.tooltip_index === cohort.id && this.setState({ tooltip_index: null, tooltip_context: null })}
        onContextMenu={(e: any) => e.preventDefault() || this.deleteCohort(cohort)}
      >
        <Cell
          image={cohort?.image || null}
          is_defeated={cohort?.is_defeated || false}
          morale={cohort?.morale || 0}
          max_morale={cohort?.max_morale || 0}
          strength={cohort?.strength || 0}
          max_strength={cohort?.max_strength || 0}
        />
      </Table.Cell>
    )
  }

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

  deleteCohort = (cohort: ICohort) => {
    if (!cohort)
      return
    const { deleteCohort, participant } = this.props
    deleteCohort(participant.country, participant.army, cohort.id)
  }
}

type CellProps = {
  strength: number
  max_strength: number
  morale: number
  max_morale: number
  is_defeated: boolean
  image: string | null
}

/** Sub-component to hopefully help with performance (easier to prevent renders). */
class Cell extends PureComponent<CellProps> {

  render() {
    const { strength, max_strength, morale, max_morale, is_defeated, image } = this.props
    if (!image)
      return this.renderImage(getImage(null))
    if (is_defeated)
      return this.renderImage(IconDefeated)
    return (
      <div style={{ background: this.gradient(MANPOWER_COLOR, strength, max_strength) }}>
        <div style={{ background: this.gradient(MORALE_COLOR, morale, max_morale) }}>
          {this.renderImage(getImage({ image }))}
        </div>
      </div>
    )
  }

  renderImage = (image: string) => <Image src={image} avatar style={{ margin: 0 }} />

  gradient = (color: string, current: number, max: number) => (
    'linear-gradient(0deg, ' + color + ' 0%, ' + color + ' ' + this.percent(current, max) + '%, ' + WHITE_COLOR + ' ' + this.percent(current, max) + '%, ' + WHITE_COLOR + ' 100%)'
  )

  percent = (current: number, max: number) => 100.0 - 100.0 * current / max
}

type ICohort = {
  id: number
  is_defeated: boolean
  image?: string
  max_morale: number
  max_strength: number
  morale: number
  strength: number
} | null | undefined

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
  participant: getParticipant(state, props.side),
  timestamp: getBattle(state).timestamp
})

const actions = { deleteCohort }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(TableArmyPart)
