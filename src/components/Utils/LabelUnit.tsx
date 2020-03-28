

import React, { Component } from 'react'
import { Image } from 'semantic-ui-react'
import { getImage } from 'utils'

interface IProps {
  item?: {
    type: string
    image?: string
    tech?: number
  }
}

export default class LabelItem extends Component<IProps> {

  render() {
    const { item } = this.props
    if (!item)
      return null
    return (
      <>
        {item.tech}
        <Image src={getImage(item)} avatar />
        {item.type}
      </>
    )
  }
}
