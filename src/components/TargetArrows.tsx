import React, { Component } from 'react'
import LineTo from 'react-lineto'

import { Side, ArmyType } from '../store/battle'

export type TargetArrowsUnit = {
  id: number
  target: number | null
} | null

type IProps = {
  visible: boolean
  attacker: TargetArrowsUnit[]
  defender: TargetArrowsUnit []
  attacker_color: string
  defender_color: string
}

/**
 * Display component for showing attack targets for both sides.
 */
export default class TargetArrows extends Component<IProps> {

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
  renderAttacker = (unit: TargetArrowsUnit, color: string) => {
    if (!unit || !unit.target)
      return null
    const from_str = Side.Attacker + '-' + ArmyType.Frontline + '-' + unit.id
    const to_str = Side.Defender + '-' + ArmyType.Frontline + '-' + unit.target
    return this.renderArrow(from_str, to_str, 'bottom', 'top', color)
  }

  renderDefender = (unit: TargetArrowsUnit, color: string) => {
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
