import React, { Component } from 'react'
import { List } from 'immutable'
import LineTo from 'react-lineto'
import { ParticipantType } from '../store/land_battle'
import { Unit, ArmyType } from '../store/units'


interface IProps {
  attacker?: List< Unit | undefined>
  defender?: List< Unit | undefined>
}

// Display component for showing unit definitions for an army.
export default class UnitArmy extends Component<IProps> {
  render(): JSX.Element {
    return (
      <div>
        {
          this.props.attacker && this.props.attacker.map((value, index) => (
            value && value.target &&
            <LineTo
              from={ParticipantType.Attacker + '-' + ArmyType.Frontline + '-' + index}
              to={ParticipantType.Defender + '-' + ArmyType.Frontline + '-' + value.target}
              />
          ))
        }
        {
          this.props.defender && this.props.defender.map((value, index) => (
            value && value.target &&
            <LineTo
              from={ParticipantType.Defender + '-' + ArmyType.Frontline + '-' + index}
              to={ParticipantType.Attacker + '-' + ArmyType.Frontline + '-' + value.target}
              />
          ))
        }
      </div>
    )
  }
}
