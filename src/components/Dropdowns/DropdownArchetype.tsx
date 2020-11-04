import React, { Component } from 'react'
import { UnitType, UnitAttribute, CombatPhase, SiteSettings, UnitDefinition } from 'types'
import DropdownTable from './DropdownTable'
import { calculateValue } from 'definition_values'

interface IProps {
  value: UnitType
  values: UnitDefinition[]
  onSelect: (type: UnitType) => void
  settings: SiteSettings
}

export default class DropdownArchetype extends Component<IProps> {
  getContent = (unit: UnitDefinition) => [
    unit.type,
    unit.tech ?? '',
    calculateValue(unit, UnitAttribute.OffensiveFirePips) + '/' + calculateValue(unit, UnitAttribute.DefensiveFirePips),
    calculateValue(unit, UnitAttribute.OffensiveShockPips) +
      '/' +
      calculateValue(unit, UnitAttribute.DefensiveShockPips),
    calculateValue(unit, UnitAttribute.OffensiveMoralePips) +
      '/' +
      calculateValue(unit, UnitAttribute.DefensiveMoralePips)
  ]

  isActive = (item: UnitDefinition) => item.type === this.props.value

  getValue = (item: UnitDefinition) => item.type

  getText = (item: UnitDefinition) => item.type + ' (' + (item.tech ?? 0) + ')'

  headers = ['Unit', 'Tech', CombatPhase.Fire, CombatPhase.Shock, UnitAttribute.Morale]

  render() {
    const { value, values, onSelect, settings } = this.props
    return (
      <DropdownTable
        value={value}
        values={values}
        headers={this.headers}
        getContent={this.getContent}
        isActive={this.isActive}
        getValue={this.getValue}
        getText={this.getText}
        onSelect={onSelect}
        settings={settings}
      />
    )
  }
}
