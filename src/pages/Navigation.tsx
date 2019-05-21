import React, { Component } from 'react'
import { Container, Menu } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

/**
 * Navigation menu for different pages.
 */
export default class Navigation extends Component {

  render() {
    return (
      <Container>
        <Menu>
          <Menu.Item>
            <Link to={'/'}>Main</Link>
          </Menu.Item>
          <Menu.Item>
            <Link to={'/units'}> Units </Link>
          </Menu.Item>
          <Menu.Item>
            <Link to={'/terrains'}>Terrains</Link>
          </Menu.Item>
          <Menu.Item>
            <Link to={'/tactics'}>Tactics</Link>
          </Menu.Item>
        </Menu>
      </Container>
    )
  }
}
