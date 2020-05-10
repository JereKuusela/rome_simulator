import React, { Component, PureComponent } from 'react'
import { connect } from 'react-redux'
import { Table, Image, Icon } from 'semantic-ui-react'

import CombatTooltip from './CombatTooltip'
import IconDefeated from 'images/attrition.png'
import { SideType, ArmyType, UnitAttribute, CombatCohort } from 'types'
import { getImage, resize } from 'utils'
import { AppState, getCurrentCombat, getBattle, getFirstParticipant } from 'state'
import { getArmyPart } from 'army_utils'
import { deleteCohort } from 'reducers'

type Props = {
  side: SideType
  rowWidth: number
  reverse: boolean
  onClick: (id: number) => void
  type: ArmyType
  color: string
  // Renders full rows for a cleaner look.
  fullRows?: boolean
}

type IState = {
  tooltipIndex: number | null
  tooltipContext: Element | null
  tooltipIsSupport: boolean
}

const MORALE_COLOR = 'rgba(200,55,55,0.60)'
const MANPOWER_COLOR = 'rgba(0,0,0,0.90)'
const WHITE_COLOR = 'rgba(255,255,255,0)'

// Shows a part of an army (frontline, reserve or defeated).
class TableArmyPart extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { tooltipIndex: null, tooltipContext: null, tooltipIsSupport: false }
  }

  shouldComponentUpdate(prevProps: IProps, prevState: IState) {
    return prevProps.timestamp !== this.props.timestamp || prevState.tooltipIndex !== this.state.tooltipIndex
  }

  render() {
    const { rowWidth, side, type, fullRows, reverse } = this.props
    const { tooltipIndex, tooltipContext, tooltipIsSupport } = this.state
    let units = this.props.units
    let indexOffset = 0
    if (fullRows) {
      units = units.map(arr => resize(arr, rowWidth, null))

    } else {
      // For display purposes, smaller combat width turns extra slots grey instead of removing them.
      const filler = Math.max(0, rowWidth - units[0].length)
      const leftFiller = indexOffset = Math.ceil(filler / 2.0)
      const rightFiller = Math.floor(filler / 2.0)
      units = units.map(row => Array(leftFiller).fill(undefined).concat(row).concat(Array(rightFiller).fill(undefined)))
    }
    if (reverse)
      units.reverse()
    return (
      <>
        <CombatTooltip id={tooltipIndex} context={tooltipContext} isSupport={tooltipIsSupport} side={side} army={type} />
        <Table compact celled definition unstackable>
          <Table.Body>
            {
              units.map((row, rowIndex) => {
                rowIndex = reverse ? units.length - 1 - rowIndex : rowIndex
                return (
                  < Table.Row key={rowIndex} textAlign='center' >
                    <Table.Cell>
                      <Icon fitted size='small' name={this.getIcon()} style={{ color: this.props.color }}></Icon>
                    </Table.Cell>
                    {
                      row.map((cohort, columnIndex) => {
                        columnIndex -= indexOffset
                        return this.renderCell(rowIndex, columnIndex, cohort, rowIndex > 0)
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

  renderCell = (row: number, column: number, cohort: ICohort, isSupport: boolean) => {
    const { side, type, onClick } = this.props
    const filler = cohort === undefined
    return (
      <Table.Cell
        className={side + '-' + type + '-' + cohort?.id}
        textAlign='center'
        key={row + '_' + column}
        disabled={filler || !cohort}
        selectable={!!onClick}
        style={{ backgroundColor: filler ? '#DDDDDD' : 'white', padding: 0 }}
        onClick={() => cohort && onClick(cohort.id)}
        onMouseOver={(e: React.MouseEvent) => cohort && this.setState({ tooltipIndex: cohort.id, tooltipContext: e.currentTarget, tooltipIsSupport: isSupport })}
        onMouseLeave={() => cohort && this.state.tooltipIndex === cohort.id && this.setState({ tooltipIndex: null, tooltipContext: null })}
        onContextMenu={(e: any) => e.preventDefault() || this.deleteCohort(cohort)}
      >
        <Cell
          image={cohort?.image || null}
          isDefeated={cohort?.isDefeated || false}
          morale={cohort?.morale || 0}
          maxMorale={cohort?.maxMorale || 0}
          strength={cohort?.strength || 0}
          maxStrength={cohort?.maxStrength || 0}
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
    deleteCohort(participant.countryName, participant.armyName, cohort.id)
  }
}

type CellProps = {
  strength: number
  maxStrength: number
  morale: number
  maxMorale: number
  isDefeated: boolean
  image: string | null
}

/** Sub-component to hopefully help with performance (easier to prevent renders). */
class Cell extends PureComponent<CellProps> {

  render() {
    const { strength, maxStrength, morale, maxMorale, isDefeated, image } = this.props
    if (!image)
      return this.renderImage(getImage(null))
    if (isDefeated)
      return this.renderImage(IconDefeated)
    return (
      <div style={{ background: this.gradient(MANPOWER_COLOR, strength, maxStrength) }}>
        <div style={{ background: this.gradient(MORALE_COLOR, morale, maxMorale) }}>
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
  isDefeated: boolean
  image?: string
  maxMorale: number
  maxStrength: number
  morale: number
  strength: number
} | null | undefined

const convertUnits = (units: (CombatCohort | null)[][]): ICohort[][] => (
  units.map(row => row.map(unit => unit && {
    id: unit.definition.id,
    isDefeated: unit.state.isDefeated,
    image: unit.definition.image,
    morale: unit[UnitAttribute.Morale],
    maxMorale: unit.definition.maxMorale,
    strength: unit[UnitAttribute.Strength],
    maxStrength: unit.definition.maxStrength
  }))
)

const mapStateToProps = (state: AppState, props: Props) => ({
  units: convertUnits(getArmyPart(getCurrentCombat(state, props.side), props.type)),
  participant: getFirstParticipant(state, props.side),
  timestamp: getBattle(state).timestamp
})

const actions = { deleteCohort }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(TableArmyPart)
