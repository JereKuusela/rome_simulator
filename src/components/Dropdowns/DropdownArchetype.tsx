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

  headers = ['Unit', 'Tech', CombatPhase.Fire, CombatPhase.Shock, UnitAttribute.Morale]

  render() {
    const { value, values, onSelect, settings } = this.props
    return (
      <DropdownTable value={value} values={values}
        headers={this.headers}
        getContent={this.getContent}
        onSelect={onSelect}
        settings={settings}
      />
    )
  }
}
