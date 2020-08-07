import React, { Component, PureComponent } from 'react'
import { connect } from 'react-redux'
import { Table, Image, Icon, Grid } from 'semantic-ui-react'

import CombatTooltip from './CombatTooltip'
import IconDefeated from 'images/attrition.png'
import { SideType, ArmyPart, UnitAttribute, Cohort, CountryName, ArmyName } from 'types'
import { getImage, resize } from 'utils'
import { AppState, getCohorts, getBattle } from 'state'
import { getArmyPart } from 'army_utils'
import { deleteCohort } from 'reducers'
import { getCohortId } from 'managers/units'
import { chunk, flatten } from 'lodash'

type Props = {
  side: SideType
  rowWidth: number
  reverse: boolean
  // SideType, participantIndex and index are needed to find the combat unit. CountryName, ArmyName and index are needed to find the definition.
  onClick: (side: SideType, participantIndex: number, index: number, country: CountryName, army: ArmyName) => void
  part: ArmyPart
  color: string
  // Renders full rows for a cleaner look.
  fullRows?: boolean
  markDefeated?: boolean
  hideIfEmpty?: boolean
}

type IState = {
  tooltipRow: number | null
  tooltipColumn: number | null
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
    this.state = { tooltipRow: null, tooltipColumn: null, tooltipContext: null, tooltipIsSupport: false }
  }

  shouldComponentUpdate(prevProps: IProps, prevState: IState) {
    return prevProps.timestamp !== this.props.timestamp || prevState.tooltipRow !== this.state.tooltipRow || prevState.tooltipColumn !== this.state.tooltipColumn
  }

  render() {
    const { rowWidth, side, part, fullRows, reverse, hideIfEmpty } = this.props
    const { tooltipRow, tooltipColumn, tooltipContext, tooltipIsSupport } = this.state
    let cohorts = this.props.cohorts
    let indexOffset = 0
    cohorts = flatten(cohorts.map(arr => chunk(arr, rowWidth)))
    if (hideIfEmpty && !cohorts.length)
      return null
    if (!cohorts.length)
      cohorts.push([])
    if (fullRows) {
      cohorts = cohorts.map(arr => resize(arr, rowWidth, null))

    } else {
      // For display purposes, smaller combat width turns extra slots grey instead of removing them.
      const filler = Math.max(0, rowWidth - cohorts[0].length)
      const leftFiller = indexOffset = Math.ceil(filler / 2.0)
      const rightFiller = Math.floor(filler / 2.0)
      cohorts = cohorts.map(row => Array(leftFiller).fill(undefined).concat(row).concat(Array(rightFiller).fill(undefined)))
    }
    if (reverse)
      cohorts.reverse()
    return (
      <Grid.Row columns={1}>
        <Grid.Column>
          <CombatTooltip row={tooltipRow} column={tooltipColumn} context={tooltipContext} isSupport={tooltipIsSupport} side={side} part={part} />
          <Table compact celled definition unstackable>
            <Table.Body>
              {
                cohorts.map((row, rowIndex) => {
                  rowIndex = reverse ? cohorts.length - 1 - rowIndex : rowIndex
                  return (
                    < Table.Row key={rowIndex} textAlign='center' >
                      <Table.Cell>
                        <Icon fitted size='small' name={this.getIcon()} style={{ color: this.props.color }}></Icon>
                      </Table.Cell>
                      {
                        row.map((cohort, columnIndex) => {
                          columnIndex -= indexOffset
                          if (part === ArmyPart.Frontline)
                            return this.renderCell(rowIndex, columnIndex, cohort, rowIndex > 0)
                          else
                            return this.renderCell(0, rowIndex * rowWidth + columnIndex, cohort, rowIndex > 0)
                        })
                      }
                    </Table.Row>
                  )
                })
              }
            </Table.Body>
          </Table>
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderCell = (row: number, column: number, cohort: ICohort, isSupport: boolean) => {
    const { side, onClick, markDefeated } = this.props
    const filler = cohort === undefined
    return (
      <Table.Cell
        className={cohort ? getCohortId(side, cohort) : ''}
        textAlign='center'
        key={row + '_' + column}
        disabled={filler || !cohort}
        selectable={!!onClick}
        style={{ backgroundColor: filler ? '#DDDDDD' : 'white', padding: 0 }}
        onClick={() => cohort && onClick(side, cohort.participantIndex, cohort.index, cohort.countryName, cohort.armyName)}
        onMouseOver={(e: React.MouseEvent) => cohort && this.setState({ tooltipRow: row, tooltipColumn: column, tooltipContext: e.currentTarget, tooltipIsSupport: isSupport })}
        onMouseLeave={() => cohort && this.state.tooltipRow === row && this.state.tooltipColumn === column && this.setState({ tooltipRow: null, tooltipColumn: null, tooltipContext: null })}
        onContextMenu={(e: any) => e.preventDefault() || this.deleteCohort(cohort)}
      >
        <Cell
          image={cohort?.image || null}
          isDefeated={(markDefeated && cohort?.isDefeated) || false}
          morale={cohort?.morale || 0}
          maxMorale={cohort?.maxMorale || 0}
          strength={cohort?.strength || 0}
          maxStrength={cohort?.maxStrength || 0}
        />
      </Table.Cell>
    )
  }

  getIcon = () => {
    const { part: type, reverse } = this.props
    if (type === ArmyPart.Frontline)
      return reverse ? 'arrow down' : 'arrow up'
    if (type === ArmyPart.Reserve)
      return 'home'
    if (type === ArmyPart.Defeated)
      return 'heartbeat'
    if (type === ArmyPart.Retreated)
      return 'trash'
    return 'square full'
  }

  deleteCohort = (cohort: ICohort) => {
    if (!cohort)
      return
    const { deleteCohort } = this.props
    deleteCohort(cohort.countryName, cohort.armyName, cohort.index)
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
  countryName: CountryName
  armyName: ArmyName
  participantIndex: number
  index: number
  isDefeated: boolean
  image?: string
  maxMorale: number
  maxStrength: number
  morale: number
  strength: number
} | null

const convertCohorts = (cohorts: (Cohort | null)[][]): ICohort[][] => (
  cohorts.map(row => row.map(cohort => cohort && {
    index: cohort.properties.index,
    participantIndex: cohort.properties.participantIndex,
    armyName: cohort.properties.armyName,
    countryName: cohort.properties.countryName,
    isDefeated: cohort.state.isDefeated,
    image: cohort.properties.image,
    morale: cohort[UnitAttribute.Morale],
    maxMorale: cohort.properties.maxMorale,
    strength: cohort[UnitAttribute.Strength],
    maxStrength: cohort.properties.maxStrength
  }))
)

const mapStateToProps = (state: AppState, props: Props) => ({
  cohorts: convertCohorts(getArmyPart(getCohorts(state, props.side), props.part)),
  timestamp: getBattle(state).timestamp
})

const actions = { deleteCohort }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(TableArmyPart)
