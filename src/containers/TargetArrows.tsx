import React, { Component } from 'react'
import { connect } from 'react-redux'
import LineTo from 'react-lineto'

import { AppState, getCurrentCombat } from 'state'
import { ArmyPart, SideType, CombatCohort } from 'types'
import { getArmyPart, getOpponent } from 'army_utils'
import { getCohortId } from 'managers/units'

type Props = {
  type: ArmyPart
  visible: boolean
  attackerColor: string
  defenderColor: string
}

/**
 * Display component for showing attack targets for both sides.
 */
class TargetArrows extends Component<IProps> {

  render() {
    const { attacker, defender, attackerColor, defenderColor, visible } = this.props
    if (!visible)
      return null
    return (
      <>
        {attacker.map(row => row.map(unit => this.renderAttacker(unit, attackerColor)))}
        {defender.map(row => row.map(unit => this.renderDefender(unit, defenderColor)))}
      </>
    )
  }
  renderAttacker = (unit: IUnit, color: string) => {
    if (!unit || !unit.target)
      return null
    const fromStr = unit.id
    const toStr =  unit.target
    return this.renderArrow(fromStr, toStr, 'bottom', 'top', color)
  }

  renderDefender = (unit: IUnit, color: string) => {
    if (!unit || !unit.target)
      return null
    const fromStr = unit.id
    const toStr = unit.target
    return this.renderArrow(fromStr, toStr, 'top', 'bottom', color)
  }

  renderArrow = (from: string, to: string, fromAnchor: string, toAnchor: string, borderColor: string) => (
    <LineTo
      key={from + '_' + to}
      borderColor={borderColor}
      from={from}
      fromAnchor={fromAnchor}
      to={to}
      toAnchor={toAnchor}
      delay={true}
      zIndex={-1}
    />
  )
}

type IUnit = {
  id: string
  target: string | null
} | null

const convertUnits = (side: SideType, units: (CombatCohort | null)[][]): IUnit[][] => (
  units.map(row => row.map(cohort => cohort ? { id: getCohortId(side, cohort.definition), target: cohort.state.target ? getCohortId(getOpponent(side), cohort.state.target.definition) : null } : null))
)

const mapStateToProps = (state: AppState, props: Props) => ({
  attacker: convertUnits(SideType.Attacker, getArmyPart(getCurrentCombat(state, SideType.Attacker), props.type)),
  defender: convertUnits(SideType.Defender, getArmyPart(getCurrentCombat(state, SideType.Defender), props.type)),
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TargetArrows)
