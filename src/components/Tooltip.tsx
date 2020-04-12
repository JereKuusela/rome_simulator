import React, { Component } from 'react'
import { Popup } from 'semantic-ui-react'

type Props = {
  getContent: () => JSX.Element
}

/**
 * Generic tooltip.
 */
export default class Tooltip extends Component<Props> {

  render() {
    return (
      <Popup
        trigger={
          this.props.children
        }
        content={this.props.getContent()}
        basic
        wide
        mouseEnterDelay={350}
        position='bottom center'
      />
    )
  }
}
