import React, { Component } from 'react'
import { Container, Grid, TextArea, Checkbox, List, Header, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { importState, ExportKey, setResetMissing, setExportKey } from '../store/transfer'
import { transformGlobalStats, transformBattle, transformTactics, transformTerrains, transformUnits, transformSettings, transformCountries } from '../store/transforms'
import { Armies, checkFight } from '../store/battle'
import { DefinitionType } from '../base_definition'

interface IState {
  data: string
}

class Transfer extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { data: '' }
  }

  last_data = ''

  readonly attributes = Object.keys(ExportKey).map(k => ExportKey[k as any]) as ExportKey[]

  render(): JSX.Element {
    const json = JSON.stringify(this.filterKeys(this.props.state), undefined, 2)
    if (this.last_data !== json) {
      this.last_data = json
      this.setState({ data: json })
    }
    return (
      <Container>
        <Grid>
          <Grid.Row columns='2'>
            <Grid.Column>
              <Header>Export</Header>
              <List>
                <List.Item>
                  1. Select which parts to import (resets any edits)
                </List.Item>
                {this.attributes.map(value => this.renderCheckbox(value))}
                <List.Item>
                  2. Copy paste the data from the text box
                </List.Item>
              </List>
              <Header>Import</Header>
              <List>
                <List.Item>
                  1. Copy paste the data to the text box
                </List.Item>
                <List.Item>
                  2. Select how to handle missing data
                </List.Item>
                <List.Item>
                  <Checkbox
                    toggle
                    label='Reset missing data'
                    checked={this.props.reset_missing}
                    onChange={() => this.props.setResetMissing(!this.props.reset_missing)}
                  />
                </List.Item>
                <List.Item>
                  3. Push the button
                </List.Item>
                <List.Item>
                  <Button primary onClick={() => this.props.importState(this.state.data, this.props.reset_missing)}>Import</Button>
                </List.Item>
              </List>
            </Grid.Column>
            <Grid.Column >
              <TextArea value={this.state.data} rows='30' style={{ width: '100%' }}
                onChange={(_, data) => this.setState({ data: String(data.value) })}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }

  renderCheckbox = (key: ExportKey): JSX.Element => {
    return (
      <List.Item>
        <Checkbox
          key={key}
          toggle
          label={key}
          disabled={this.checkDisabled(key)}
          checked={this.props.export_keys.get(key)}
          onChange={() => this.props.setExportKey(key, !this.props.export_keys.get(key))}
        />
      </List.Item>)
  }

  checkDisabled = (key: ExportKey): boolean => {
    if (key === ExportKey.History && !this.props.export_keys.get(ExportKey.Land) && !this.props.export_keys.get(ExportKey.Naval))
      return true
    if (key === ExportKey.History && this.props.export_keys.get(ExportKey.InitialOnly))
      return true
    if (key === ExportKey.InitialOnly && !this.props.export_keys.get(ExportKey.Land) && !this.props.export_keys.get(ExportKey.Naval))
      return true
    if (key === ExportKey.InitialOnly && this.props.export_keys.get(ExportKey.History))
      return true
    return false
  }

  /**
   * Restores the initial state of armies and removes history.
   */
  getInitialOnly = (mode: Armies): Armies => {
    const past_a = mode.attacker_past && mode.attacker_past.get(0)
      if (mode.round > -1 && past_a) {
       mode = {
          ...mode,
          armies: mode.armies.update(mode.attacker, value => ({ ...value, ...past_a})),
          attacker_past: mode.attacker_past.clear()
        } 
      }
      const past_d = mode.defender_past && mode.defender_past.get(0)
      if (mode.round > -1 && past_d) {
        mode = {
          ...mode,
          armies: mode.armies.update(mode.defender, value => ({ ...value, ...past_d})),
          attacker_past: mode.defender_past.clear()
        } 
      }
      return {
        ...mode,
        round: -1,
        fight_over: !checkFight(mode.armies.get(mode.attacker), mode.armies.get(mode.defender))
      }
  }

  /**
   * Removes history information.
   */
  removeHistory = (mode: Armies): Armies => {
    return {
      ...mode,
        attacker_past: mode.attacker_past.clear(),
        defender_past: mode.defender_past.clear(),
        round: -1
    }
  }

  filterKeys = (state: AppState): any => {
    const new_state: any = { ...state }
    new_state._persist = undefined
    new_state.transfer = undefined
    new_state.data = undefined
    if (!this.props.export_keys.get(ExportKey.Countries))
      new_state.countries = undefined
    if (!this.props.export_keys.get(ExportKey.Units))
      new_state.global_stats = undefined
    if (!this.props.export_keys.get(ExportKey.Terrains))
      new_state.terrains = undefined
    if (!this.props.export_keys.get(ExportKey.Tactics))
      new_state.tactics = undefined
    if (!this.props.export_keys.get(ExportKey.Tactics))
      new_state.tactics = undefined
    if (!this.props.export_keys.get(ExportKey.Settings))
      new_state.settings = undefined
    if (!this.props.export_keys.get(ExportKey.Land))
      new_state.battle = new_state.battle.delete(DefinitionType.Land)
    else if (this.props.export_keys.get(ExportKey.InitialOnly))
      new_state.battle = new_state.battle.update(DefinitionType.Land, this.getInitialOnly)
    else if (!this.props.export_keys.get(ExportKey.History))
      new_state.battle = new_state.battle.update(DefinitionType.Land, this.removeHistory)
    if (!this.props.export_keys.get(ExportKey.Naval))
      new_state.battle = new_state.battle.delete(DefinitionType.Naval)
    else if (this.props.export_keys.get(ExportKey.InitialOnly))
      new_state.battle = new_state.battle.update(DefinitionType.Naval, this.getInitialOnly)
    else if (!this.props.export_keys.get(ExportKey.History))
      new_state.battle = new_state.battle.update(DefinitionType.Naval, this.removeHistory)
    if (!this.props.export_keys.get(ExportKey.Land) && !this.props.export_keys.get(ExportKey.Naval))
      new_state.battle = undefined
    return new_state
  }
}

const mapStateToProps = (state: AppState) => ({
  state: state,
  export_keys: state.transfer.export_keys,
  reset_missing: state.transfer.reset_missing
})

const mapDispatchToProps = (dispatch: any) => ({
  setExportKey: (key: ExportKey, value: boolean) => dispatch(setExportKey(key, value)),
  setResetMissing: (value: boolean) => dispatch(setResetMissing(value)),
  importState: (data: string, reset_missing: boolean) => {
    try {
      if (!data)
        data = '{}'
      let json = JSON.parse(data)
      json.transfer = undefined
      json.battle = (json.battle || reset_missing) && transformBattle(json.battle)
      json.tactics = (json.tactics || reset_missing) && transformTactics(json.tactics)
      json.terrains = (json.terrains || reset_missing) && transformTerrains(json.terrains)
      json.units = (json.units || reset_missing) && transformUnits(json.units)
      json.settings = (json.settings || reset_missing) && transformSettings(json.settings)
      json.countries = (json.countries || reset_missing) && transformCountries(json.countries)
      json.global_stats = (json.global_stats || reset_missing) && transformGlobalStats(json.global_stats)
      Object.keys(json).filter(key => !json[key]).forEach(key => delete json[key])
      dispatch(importState(json, reset_missing))
    }
    catch (err) {
      console.error(err)
    }
  }
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Transfer)
