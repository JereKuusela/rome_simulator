import React, { Component } from 'react'
import PaddedRow from '../Utils/PaddedRow'

interface IProps {
  text: string
  value: string | number
  cells: number
  stretch?: number
}

export default class DetailTextRow extends Component<IProps> {
  render() {
    const { text, value, cells, stretch } = this.props
    return (
      <PaddedRow cells={cells} stretch={stretch}>
        {text}
        {value}
      </PaddedRow>
    )
  }
}
