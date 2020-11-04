import React, { Component } from 'react'
import { Image } from 'semantic-ui-react'

interface IProps {
  values: string[]
}

export default class Images extends Component<IProps> {
  render() {
    const { values } = this.props
    return (
      <>
        {values.map(image => (
          <Image key={image} src={image} avatar />
        ))}
      </>
    )
  }
}
