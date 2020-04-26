import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState, getMode } from 'state'
import { setMode } from 'reducers'
import { Menu, Image, Button } from 'semantic-ui-react'
import IconLand from 'images/land_combat.png'
import IconNaval from 'images/naval_combat.png'
import { Mode } from 'types'

interface Props { }

/**
 * Navigation menu for different pages.
 */
class Navigation extends Component<IProps> {

  render() {
    const { mode, setMode } = this.props
    const path = (this.props as any).location.pathname
    const history = (this.props as any).history
    return (
      <div id='navigation'>
        <Menu>
          <Menu.Item active={path === '/'} onClick={() => history.push('/')}>
            Battle
          </Menu.Item>
          <Menu.Item active={path === '/analyze'} onClick={() => history.push('/analyze')}>
            Analyze
          </Menu.Item>
          <Menu.Item active={path === '/countries'} onClick={() => history.push('/countries')}>
            Countries
          </Menu.Item>
          <Menu.Item active={path === '/definitions'} onClick={() => history.push('/definitions')}>
            Definitions
          </Menu.Item>
          <Menu.Item active={path === '/settings'} onClick={() => history.push('/settings')}>
            Settings
          </Menu.Item>
          {process.env.REACT_APP_GAME === 'ir' &&
            <Menu.Item active={path === '/import'} onClick={() => history.push('/import')}>
              Import save
          </Menu.Item>
          }

          <div id='menu-info'>
            {process.env.REACT_APP_GAME === 'ir' &&
              <Button active={mode === Mode.Land} compact icon basic circular size='tiny' onClick={() => setMode(Mode.Land)}>
                <Image src={IconLand} avatar style={{ marginRight: 0 }} />
              </Button>
            }
            {process.env.REACT_APP_GAME === 'ir' &&
              <Button active={mode === Mode.Naval} compact icon basic circular size='tiny' onClick={() => setMode(Mode.Naval)}>
                <Image src={IconNaval} avatar style={{ marginRight: 0 }} />
              </Button>
            }
            <div id='version'><div>Site version 0.6.6</div><div>Game version {process.env.REACT_APP_GAME === 'ir' ? '1.4.2' : '1.29.5'}</div></div>
          </div>
        </Menu>
        <br />
      </div >
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  mode: getMode(state)
})

const actions = { setMode }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Navigation)
