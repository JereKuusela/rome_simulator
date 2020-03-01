

import React, { Component } from 'react'
import { Image } from 'semantic-ui-react'
import { getImage } from 'utils'

interface IProps {
  unit?: {
    type: string
    image?: string
    tech?: number
  }
}

export default class LabelItem extends Component<IProps> {

  render() {
    const { unit } = this.props
    if (!unit)
      return null
    return (
      <>
        {unit.tech}
        <Image src={getImage(unit)} avatar />
        {unit.type}
      </>
    )
  }
}
