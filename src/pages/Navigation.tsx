import React, { Component } from 'react'
import { Container, Menu } from 'semantic-ui-react'

/**
 * Navigation menu for different pages.
 */
export default class Navigation extends Component {

  render() {
    const path = (this.props as any).location.pathname
    const history = (this.props as any).history
    return (
      <Container>
        <Menu>
          <Menu.Item active={path === '/'} onClick={() => history.push('/')}>
            Battle
          </Menu.Item>
          <Menu.Item active={path === '/units'} onClick={() => history.push('/units')}>
            Units
          </Menu.Item>
          <Menu.Item active={path === '/terrains'} onClick={() => history.push('/terrains')}>
            Terrains
          </Menu.Item>
          <Menu.Item active={path === '/tactics'} onClick={() => history.push('/tactics')}>
            Tactics
          </Menu.Item>
          <Menu.Item active={path === '/stats'} onClick={() => history.push('/stats')}>
            Stats
          </Menu.Item>
          <Menu.Item active={path === '/transfer'} onClick={() => history.push('/transfer')}>
            Transfer
          </Menu.Item>
          <div style={{ padding: '0.5rem', width: '100%', textAlign: 'right' }}>Site version 0.1.2</div>
        </Menu>
        <br />
      </Container>
    )
  }
}
