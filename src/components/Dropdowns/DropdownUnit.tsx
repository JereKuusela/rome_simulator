import React, { Component } from 'react'
import { Unit, UnitType, SiteSettings } from 'types'
import DropdownTable from './DropdownTable'
import LabelItem from 'components/Utils/LabelUnit'

type IProps = {
  value: UnitType
  values: Unit[]
  onSelect: (type: UnitType) => void
  settings: SiteSettings
}

export default class DropdownUnit extends Component<IProps> {

  getContent = (unit: Unit) => ([
    <LabelItem item={unit} />
  ])

  isActive = (item: Unit) => item.type === this.props.value

  getValue = (item: Unit) => item.type


  headers = []

  render() {
    const { value, values, onSelect, settings } = this.props
    return (
      <DropdownTable value={value} values={values}
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
