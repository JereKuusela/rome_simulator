import React, { Component } from 'react'
import { connect } from 'react-redux'
import LineTo from 'react-lineto'

import { Side, ArmyType } from '../store/battle'
import { AppState } from '../store/'
import { getCurrentCombat } from '../store/utils'

import { CombatUnit } from '../combat/combat'
import { getArmyPart } from '../army_utils'

type Props = {
  type: ArmyType
  visible: boolean
  attacker_color: string
  defender_color: string
}

/**
 * Display component for showing attack targets for both sides.
 */
class TargetArrows extends Component<IProps> {

  render() {
    const { attacker, defender, attacker_color, defender_color, visible } = this.props
    if (!visible)
      return null
    return (
      <>
        {attacker.map(unit => this.renderAttacker(unit, attacker_color))}
        {defender.map(unit => this.renderDefender(unit, defender_color))}
      </>
    )
  }
  renderAttacker = (unit: IUnit, color: string) => {
    if (!unit || !unit.target)
      return null
    const from_str = Side.Attacker + '-' + ArmyType.Frontline + '-' + unit.id
    const to_str = Side.Defender + '-' + ArmyType.Frontline + '-' + unit.target
    return this.renderArrow(from_str, to_str, 'bottom', 'top', color)
  }

  renderDefender = (unit: IUnit, color: string) => {
    if (!unit || !unit.target)
      return null
    const from_str = Side.Defender + '-' + ArmyType.Frontline + '-' + unit.id
    const to_str = Side.Attacker + '-' + ArmyType.Frontline + '-' + unit.target
    return this.renderArrow(from_str, to_str, 'top', 'bottom', color)
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

const convertUnits = (units: (CombatUnit | null)[]): IUnit[] => (
  units.map(unit => unit ? { id: unit.definition.id, target: unit.state.target?.definition.id } : null)
)

const mapStateToProps = (state: AppState, props: Props) => ({
  attacker: convertUnits(getArmyPart(getCurrentCombat(state, Side.Attacker), props.type)),
  defender: convertUnits(getArmyPart(getCurrentCombat(state, Side.Defender), props.type)),
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TargetArrows)
