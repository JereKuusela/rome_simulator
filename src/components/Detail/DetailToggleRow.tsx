import React, { Component } from 'react'
import PaddedRow from '../PaddedRow'
import DetailToggle from './DetailToggle'

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
        <DetailToggle value={value} onChange={onChange} />
      </PaddedRow>
    )
  }
}
