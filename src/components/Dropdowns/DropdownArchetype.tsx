import React, { Component } from 'react'
import { UnitType, UnitAttribute, CombatPhase, CombatCohortDefinition } from 'types'
import DropdownTable from './DropdownTable'

interface IProps {
  value: UnitType
  values: CombatCohortDefinition[]
  onSelect: (type: UnitType) => void
}

export default class DropdownArchetype extends Component<IProps> {

  getContent = (unit: CombatCohortDefinition) => ([
    unit.type,
    unit.tech ?? '',
    unit[UnitAttribute.OffensiveFirePips] + '/' + unit[UnitAttribute.DefensiveFirePips],
    unit[UnitAttribute.OffensiveShockPips] + '/' + unit[UnitAttribute.DefensiveShockPips],
    unit[UnitAttribute.OffensiveMoralePips] + '/' + unit[UnitAttribute.DefensiveMoralePips],
  ])

  headers = ['Unit', 'Tech', CombatPhase.Fire, CombatPhase.Shock, UnitAttribute.Morale]

  render() {
    const { value, values, onSelect } = this.props
    return (
      <DropdownTable value={value} values={values}
        headers={this.headers}
        getContent={this.getContent}
        onSelect={onSelect}
      />
    )
  }
}
