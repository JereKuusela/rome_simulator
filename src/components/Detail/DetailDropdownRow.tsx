import React, { Component } from 'react'
import PaddedRow from '../Utils/PaddedRow'
import SimpleDropdown from '../Dropdowns/SimpleDropdown'

interface IProps<T extends string> {
  text: string
  values: T[]
  value: T
  onChange?: (value: T) => void
  cells: number
  stretch?: number
}

export default class DetailDropdownRow<T extends string> extends Component<IProps<T>> {
  render() {
    const { text, value, values, onChange, cells, stretch } = this.props
    return (
      <PaddedRow cells={cells} stretch={stretch}>
        {text}
        <SimpleDropdown value={value} values={values} onChange={onChange} />
      </PaddedRow>
    )
  }
}
