import React, { Component } from 'react'
import { UnitDefinition, UnitType, CombatSharedSettings } from 'types'
import DropdownTable from './DropdownTable'
import LabelItem from 'components/Utils/LabelUnit'

type IProps = {
  value: UnitType
  values: UnitDefinition[]
  onSelect: (type: UnitType) => void
  settings: CombatSharedSettings
}

export default class DropdownUnit extends Component<IProps> {
  getContent = (unit: UnitDefinition) => [<LabelItem item={unit} />]

  isActive = (item: UnitDefinition) => item.type === this.props.value

  getValue = (item: UnitDefinition) => item.type

  headers = []

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
        onSelect={onSelect}
        trigger={<LabelItem item={values.find(unit => unit.type === value)} />}
        settings={settings}
      />
    )
  }
}
