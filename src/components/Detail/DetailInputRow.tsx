import React, { Component } from 'react'
import PaddedRow from '../Utils/PaddedRow'
import Input from '../Utils/Input'

interface IProps<T extends string> {
  text: string
  value: T
  onChange?: (value: T) => void
  cells: number
  stretch?: number
}

export default class DetailInputRow<T extends string> extends Component<IProps<T>> {
  render() {
    const { text, value, onChange, cells, stretch } = this.props
    return (
      <PaddedRow cells={cells} stretch={stretch}>
        {text}
        <Input value={value} onChange={onChange} />
      </PaddedRow>
    )
  }
}
