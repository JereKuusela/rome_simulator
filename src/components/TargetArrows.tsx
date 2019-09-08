import React, { Component } from 'react'
import LineTo from 'react-lineto'
import { Side, ArmyType, BaseFrontLine } from '../store/battle'


interface IProps {
  attacker?: BaseFrontLine
  defender?: BaseFrontLine
  attacker_color: string
  defender_color: string
}

// Display component for showing unit definitions for an army.
export default class UnitArmy extends Component<IProps> {
  render(): JSX.Element {
    return (
      <div>
        {
          this.props.attacker && this.props.attacker.map((value, index) => (
            value && value.target !== null && value.target !== undefined  &&
            <LineTo
              borderColor={this.props.attacker_color}
              from={Side.Attacker + '-' + ArmyType.Frontline + '-' + index}
              fromAnchor='bottom'
              to={Side.Defender + '-' + ArmyType.Frontline + '-' + value.target}
              toAnchor='top'
              delay={true}
              zIndex={-1}
              />
          ))
        }
        {
          this.props.defender && this.props.defender.map((value, index) => (
            value && value.target !== null && value.target !== undefined &&
            <LineTo
            borderColor={this.props.defender_color}
              from={Side.Defender + '-' + ArmyType.Frontline + '-' + index}
              fromAnchor='top'
              to={Side.Attacker + '-' + ArmyType.Frontline + '-' + value.target}
              toAnchor='bottom'
              delay={true}
              zIndex={-1}
              />
          ))
        }
      </div>
    )
  }
}
