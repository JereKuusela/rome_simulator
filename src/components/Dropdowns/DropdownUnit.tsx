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

  headers = []

  render() {
    const { value, values, onSelect, settings } = this.props
    return (
      <DropdownTable value={value} values={values}
        headers={this.headers}
        getContent={this.getContent}
        onSelect={onSelect}
        trigger={<LabelItem item={values.find(unit => unit.type === value)} />}
        settings={settings}
      />
    )
  }
}
