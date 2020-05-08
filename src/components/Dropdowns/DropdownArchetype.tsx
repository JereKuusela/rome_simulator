import React, { Component } from 'react'
import { UnitType, UnitAttribute, CombatPhase, SiteSettings, Unit } from 'types'
import DropdownTable from './DropdownTable'
import { calculateValue } from 'definition_values'

interface IProps {
  value: UnitType
  values: Unit[]
  onSelect: (type: UnitType) => void
  settings: SiteSettings
}

export default class DropdownArchetype extends Component<IProps> {

  getContent = (unit: Unit) => ([
    unit.type,
    unit.tech ?? '',
    calculateValue(unit, UnitAttribute.OffensiveFirePips) + '/' + calculateValue(unit, UnitAttribute.DefensiveFirePips),
    calculateValue(unit, UnitAttribute.OffensiveShockPips) + '/' + calculateValue(unit, UnitAttribute.DefensiveShockPips),
    calculateValue(unit, UnitAttribute.OffensiveMoralePips) + '/' + calculateValue(unit, UnitAttribute.DefensiveMoralePips)
  ])

  isActive = (item: Unit) => item.type === this.props.value

  getValue = (item: Unit) => item.type

  getText = (item: Unit) => item.type + ' (' + (item.tech ?? 0) + ')'

  headers = ['Unit', 'Tech', CombatPhase.Fire, CombatPhase.Shock, UnitAttribute.Morale]

  render() {
    const { value, values, onSelect, settings } = this.props
    return (
      <DropdownTable value={value} values={values}
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
