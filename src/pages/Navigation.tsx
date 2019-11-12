import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { toggleMode } from '../store/settings'
import { Container, Menu, Image, Button } from 'semantic-ui-react'
import IconLand from '../images/land_combat.png'
import IconNaval from '../images/naval_combat.png'
import { DefinitionType } from '../base_definition'

/**
 * Navigation menu for different pages.
 */
class Navigation extends Component<IProps> {

  render(): JSX.Element {
    const path = (this.props as any).location.pathname
    const history = (this.props as any).history
    return (
      <Container id='navigation'>
        <Menu>
          <Menu.Item active={path === '/'} onClick={() => history.push('/')}>
            Battle
          </Menu.Item>
          <Menu.Item active={path === '/stats'} onClick={() => history.push('/stats')}>
            Stats
          </Menu.Item>
          <Menu.Item active={path === '/countries'} onClick={() => history.push('/countries')}>
            Countries
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
          <Menu.Item active={path === '/settings'} onClick={() => history.push('/settings')}>
            Settings
          </Menu.Item>
          <Menu.Item active={path === '/transfer'} onClick={() => history.push('/transfer')}>
            Transfer
          </Menu.Item>
          <Menu.Item active={path === '/instructions'} onClick={() => history.push('/instructions')}>
            Instructions
          </Menu.Item>
          
          <div id='menu-info'>
            <Button active={this.props.mode === DefinitionType.Land} compact icon basic circular size='tiny' onClick={this.props.toggleMode}>
              <Image src={IconLand} avatar style={{ marginRight: 0 }} />
            </Button>
            <Button active={this.props.mode === DefinitionType.Naval} compact icon basic circular size='tiny' onClick={this.props.toggleMode}>
              <Image src={IconNaval} avatar style={{ marginRight: 0 }} />
            </Button>
            <div id='version'><div>Site version 0.5.0</div><div>Game version 1.2</div></div>
          </div>
        </Menu>
        <br />
      </Container>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  toggleMode: () => dispatch(toggleMode())
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Navigation)
