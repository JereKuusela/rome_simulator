import React, { Component } from 'react'
import { Popup, Icon } from 'semantic-ui-react'

interface Props {
  value: string
  formula?: string
}

/**
 * Generic tooltip to show help.
 */
export default class HelpTooltip extends Component<Props> {
  render() {
    return (
      <Popup
        trigger={
          <div style={{ paddingLeft: 5, display: 'inline' }}>
            <Icon circular size='small' name='help' />
          </div>
        }
        content={this.getContent()}
        basic
        wide
        mouseEnterDelay={350}
      />
    )
  }

  getContent = () => {
    const { value, formula } = this.props
    return (
      <>
        <p>{value}</p>
        {formula && <p>{formula}</p>}
      </>
    )
  }
}
