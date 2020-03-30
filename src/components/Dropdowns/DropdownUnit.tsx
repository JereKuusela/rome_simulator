import React, { Component } from 'react'
import { Unit, UnitType } from 'types'
import DropdownTable from './DropdownTable'
import LabelItem from 'components/Utils/LabelUnit'

interface IProps {
  value: UnitType
  values: Unit[]
  onSelect: (type: UnitType) => void
}

export default class DropdownUnit extends Component<IProps> {

  getContent = (unit: Unit) => ([
    <LabelItem item={unit} />
  ])

  headers = []

  render() {
    const { value, values, onSelect } = this.props
    return (
      <DropdownTable value={value} values={values}
        headers={this.headers}
        getContent={this.getContent}
        onSelect={onSelect}
        trigger={<LabelItem item={values.find(unit => unit.type === value)} />}
      />
    )
  }
}
