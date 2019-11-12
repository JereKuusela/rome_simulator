import React, { Component } from 'react'
import LineTo from 'react-lineto'

import { Side, ArmyType, BaseFrontLine } from '../store/battle'

interface IProps {
  visible: boolean
  attacker: BaseFrontLine
  defender: BaseFrontLine
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
        {
          this.getTargets(attacker).map(([from, to]) => this.renderAttacker(from, to, attacker_color))
        }
        {
          this.getTargets(defender).map(([from, to]) => this.renderDefender(from, to, defender_color))
        }
      </>
    )
  }

  getTargets = (front: BaseFrontLine) => {
    const targets = front.map((unit, index) => unit && unit.target !== null && [index, unit.target!])
    return targets.filter(data => data) as [number, number][]
  }

  renderAttacker = (from: number, to: number, color: string) => {
    const from_str = Side.Attacker + '-' + ArmyType.Frontline + '-' + from
    const to_str = Side.Defender + '-' + ArmyType.Frontline + '-' + to
    return this.renderArrow(from_str, to_str, 'bottom', 'top', color)
  }

  renderDefender = (from: number, to: number, color: string) => {
    const from_str = Side.Defender + '-' + ArmyType.Frontline + '-' + from
    const to_str = Side.Attacker + '-' + ArmyType.Frontline + '-' + to
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
