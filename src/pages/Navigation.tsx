import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMode } from 'state'
import { setMode } from 'reducers'
import { Menu, Image, Button } from 'semantic-ui-react'
import IconLand from 'images/land_combat.png'
import IconNaval from 'images/naval_combat.png'
import { Mode } from 'types'
import { useHistory } from 'react-router-dom'

/**
 * Navigation menu for different pages.
 */
const Navigation = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const path = history.location.pathname

  const currentMode = useSelector(getMode)

  const renderModeButton = (mode: Mode) => {
    return (
      <Button
        active={mode === currentMode}
        compact
        icon
        basic
        circular
        size='tiny'
        onClick={() => dispatch(setMode(mode))}
      >
        <Image src={mode === Mode.Land ? IconLand : IconNaval} avatar style={{ marginRight: 0 }} />
      </Button>
    )
  }

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
        {process.env.REACT_APP_GAME === 'IR' && (
          <Menu.Item active={path === '/import'} onClick={() => history.push('/import')}>
            Import from save
          </Menu.Item>
        )}
        {process.env.REACT_APP_GAME === 'IR' && (
          <Menu.Item active={path === '/export'} onClick={() => history.push('/export')}>
            Export from save
          </Menu.Item>
        )}

        <div id='menu-info'>
          {process.env.REACT_APP_GAME === 'IR' && renderModeButton(Mode.Land)}
          {process.env.REACT_APP_GAME === 'IR' && renderModeButton(Mode.Naval)}
          <div id='version'>
            <div>Site version 0.8.2</div>
            <div>Game version {process.env.REACT_APP_GAME === 'IR' ? '1.5.3' : '1.30.4'}</div>
          </div>
        </div>
      </Menu>
      <br />
    </div>
  )
}

export default Navigation
