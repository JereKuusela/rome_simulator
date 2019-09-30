import React, { Component } from 'react'
import { Button, Image } from 'semantic-ui-react'

import IconYes from '../../images/yes.png'
import IconNo from '../../images/no.png'

interface IProps {
  value: boolean
  onChange?: () => void
}


export default class DetailToggle extends Component<IProps> {

  render() {
    const { value, onChange } = this.props
    return (
      <Button size='mini' basic compact disabled={!onChange} className='no-dim' onClick={() => onChange && onChange()}>
        <Image avatar src={value ? IconYes : IconNo} />
      </Button>
    )
  }
}
