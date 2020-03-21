import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState, getMode, getSettings } from 'state'
import { toggleMode } from 'reducers'
import { Menu, Image, Button } from 'semantic-ui-react'
import IconLand from 'images/land_combat.png'
import IconNaval from 'images/naval_combat.png'
import { Mode, Setting } from 'types'

interface Props { }

/**
 * Navigation menu for different pages.
 */
class Navigation extends Component<IProps> {

  render() {
    const { settings, mode, toggleMode } = this.props
    const path = (this.props as any).location.pathname
    const history = (this.props as any).history
    return (
      <div id='navigation'>
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
          {
            settings[Setting.Tactics] &&
            <Menu.Item active={path === '/tactics'} onClick={() => history.push('/tactics')}>
              Tactics
            </Menu.Item>
          }
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
            {process.env.REACT_APP_GAME === 'ir' &&
              <Button active={mode === Mode.Land} compact icon basic circular size='tiny' onClick={toggleMode}>
                <Image src={IconLand} avatar style={{ marginRight: 0 }} />
              </Button>
            }
            {process.env.REACT_APP_GAME === 'ir' &&
              <Button active={mode === Mode.Naval} compact icon basic circular size='tiny' onClick={toggleMode}>
                <Image src={IconNaval} avatar style={{ marginRight: 0 }} />
              </Button>
            }
            <div id='version'><div>Site version 0.6.b</div><div>Game version {process.env.REACT_APP_GAME === 'ir' ? '1.3.2' : '???'}</div></div>
          </div>
        </Menu>
        <br />
      </div >
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  mode: getMode(state),
  settings: getSettings(state)
})

const actions = { toggleMode }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Navigation)
