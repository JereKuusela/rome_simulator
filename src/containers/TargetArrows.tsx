import React, { Component } from 'react'
import { connect } from 'react-redux'
import LineTo from 'react-lineto'

import { AppState, getCurrentCombat } from 'state'
import { ArmyType, SideType, CombatCohort } from 'types'
import { getArmyPart } from 'army_utils'

type Props = {
  type: ArmyType
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
    const fromStr = SideType.Attacker + '-' + ArmyType.Frontline + '-' + unit.id
    const toStr = SideType.Defender + '-' + ArmyType.Frontline + '-' + unit.target
    return this.renderArrow(fromStr, toStr, 'bottom', 'top', color)
  }

  renderDefender = (unit: IUnit, color: string) => {
    if (!unit || !unit.target)
      return null
    const fromStr = SideType.Defender + '-' + ArmyType.Frontline + '-' + unit.id
    const toStr = SideType.Attacker + '-' + ArmyType.Frontline + '-' + unit.target
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
  id: number
  target: number | null | undefined
} | null

const convertUnits = (units: (CombatCohort | null)[][]): IUnit[][] => (
  units.map(row => row.map(unit => unit ? { id: unit.definition.id, target: unit.state.target?.definition.id } : null))
)

const mapStateToProps = (state: AppState, props: Props) => ({
  attacker: convertUnits(getArmyPart(getCurrentCombat(state, SideType.Attacker), props.type)),
  defender: convertUnits(getArmyPart(getCurrentCombat(state, SideType.Defender), props.type)),
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TargetArrows)
