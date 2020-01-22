import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Input, Table, Header, Checkbox, Tab } from 'semantic-ui-react'

import { changeCombatParameter, changeSiteParameter, Setting, parameterToDescription, SiteSettings, CombatSettings, SimulationSpeed } from '../store/settings'
import { invalidate } from '../store/battle'
import { AppState } from '../store/index'

import { toArr, keys, values } from '../utils'
import { DefinitionType, Mode } from '../base_definition'
import Dropdown from '../components/Utils/Dropdown'

interface Props { }

type Values = string | number | boolean

class Settings extends Component<IProps> {

  render() {
    const { combatSettings, siteSettings } = this.props
    const panes = toArr(combatSettings, (settings, mode) => ({
      menuItem: mode, render: () => <Tab.Pane style={{ padding: 0 }}>{this.renderRow(mode, settings, (key, str) => this.onCombatChange(mode, key, str))}</Tab.Pane>
    }))
    return (<>
      <Tab panes={panes} defaultActiveIndex={keys(combatSettings).findIndex(mode => mode === this.props.mode)} />
      {this.renderRow('Shared', siteSettings, this.onSharedChange)}
    </>)
  }

  renderRow = <T extends Setting>(mode: string, settings: { [key in T]: Values }, onChange: (key: T, str: Values) => void) => (
    <Grid padded celled key={mode}>
      <Grid.Row columns='2'>
        {
          toArr(settings, (value, key) => {
            return (
              <Grid.Column key={key}>
                <Table basic='very'>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell collapsing style={{ width: 100 }} textAlign='center' >
                        {this.renderSetting(key, value, onChange)}
                      </Table.Cell>
                      <Table.Cell key={key + '_description'} style={{ whiteSpace: 'pre-line' }} >
                        <Header size='tiny'>{key}</Header>
                        {parameterToDescription(key, value)}
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Grid.Column>
            )
          })
        }
        {
          toArr(settings).length % 2 ? <Grid.Column /> : null
        }
      </Grid.Row>
    </Grid>
  )

  renderSetting = <T extends Setting>(key: T, value: Values, onChange: (key: T, str: Values) => void) => {
    if (typeof value === 'number') {
      return (
        <Input
          size='mini'
          style={{ width: 60 }}
          defaultValue={value}
          onChange={(_, { value }) => this.onInputChange(key, value, onChange)}
        />
      )
    }
    if (typeof value === 'boolean') {
      return (
        <Checkbox
          checked={value}
          onChange={(_, { checked }) => onChange(key, !!checked)}
        />
      )
    }
    if (key === Setting.Performance) {
      return (
        <Dropdown
          value={value}
          style={{ width: 100 }}
          values={values(SimulationSpeed)}
          onChange={value => onChange(key, value)}
        />
      )
    }
    return null
  }

  onInputChange = <T extends Setting>(key: T, str: string, onChange: (key: T, value: number) => void) => {
    const value = +str
    if (isNaN(value))
      return
    onChange(key, value)
  }

  onCombatChange = (mode: Mode, key: keyof CombatSettings, value: Values) => {
    const { changeCombatParameter, invalidate } = this.props
    changeCombatParameter(mode, key, value)
    invalidate(mode)
  }

  onSharedChange = (key: keyof SiteSettings, value: Values) => {
    const { changeSiteParameter, invalidate } = this.props
    changeSiteParameter(key, value)
    invalidate(DefinitionType.Land)
    invalidate(DefinitionType.Naval)
  }
}

const mapStateToProps = (state: AppState) => ({
  combatSettings: state.settings.combatSettings,
  siteSettings: state.settings.siteSettings,
  mode: state.settings.mode
})

const actions = { changeCombatParameter, changeSiteParameter, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Settings)
