import React, { Component } from 'react'

/**
 * Helper to prevent item from overflowing.
 * These are needed to simplify UI development. Lots of things must be on the screen and Imperator / EUIV have different needs too.
 */
export default class OverflowGuard extends Component {

  render() {
    return (
      <div style={{overflowX: 'auto'}}>
        {this.props.children}
      </div>
    )
  }
}
