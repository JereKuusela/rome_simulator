import React, { Component } from 'react'
import PaddedRow from '../Utils/PaddedRow'
import Toggle from '../Utils/Toggle'

interface IProps {
  text: string
  value: boolean
  onChange?: () => void
  cells: number
  stretch?: number
}

export default class DetailToggleRow extends Component<IProps> {
  render() {
    const { text, value, onChange, cells, stretch } = this.props
    return (
      <PaddedRow cells={cells} stretch={stretch}>
        {text}
        <Toggle value={value} onChange={onChange} />
      </PaddedRow>
    )
  }
}
