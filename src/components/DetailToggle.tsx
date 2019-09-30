import React, { Component } from 'react'
import { Button, Image } from 'semantic-ui-react'

import IconYes from '../images/yes.png'
import IconNo from '../images/no.png'

interface IProps {
  value: boolean
  onClick?: () => void
}


export default class DetailToggle extends Component<IProps> {

  render() {
    const { value, onClick } = this.props
    return (
      <Button size='mini' basic compact disabled={!onClick} className='no-dim' onClick={() => onClick && onClick()}>
        <Image avatar src={value ? IconYes : IconNo} />
      </Button>
    )
  }
}
