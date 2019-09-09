import React, { Component } from 'react'
import { Container, Grid, TextArea, Checkbox, List, Header, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { importState, ExportKey, setResetMissing, setExportKey } from '../store/transfer'
import { transformGlobalStats, transformBattle, transformTactics, transformTerrains, transformUnits, transformSettings, stripRounds } from '../store/transforms'
import { DefinitionType } from '../base_definition'
import { countriesState } from '../store/countries'
import { values } from '../utils'

interface IState {
  data: string
}

class Transfer extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { data: '' }
  }

  last_data = ''

  readonly attributes = values(ExportKey)

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
          checked={this.props.export_keys[key]}
          onChange={() => this.props.setExportKey(key, !this.props.export_keys[key])}
        />
      </List.Item>)
  }

  filterKeys = (state: AppState): any => {
    const new_state: any = { ...state }
    new_state._persist = undefined
    new_state.transfer = undefined
    new_state.data = undefined
    new_state.battle = stripRounds(new_state.battle)
    if (!this.props.export_keys[ExportKey.Countries])
      new_state.countries = undefined
    if (!this.props.export_keys[ExportKey.Units])
      new_state.units = undefined
    if (!this.props.export_keys[ExportKey.Units])
      new_state.global_stats = undefined
    if (!this.props.export_keys[ExportKey.Terrains])
      new_state.terrains = undefined
    if (!this.props.export_keys[ExportKey.Tactics])
      new_state.tactics = undefined
    if (!this.props.export_keys[ExportKey.Settings])
      new_state.settings = undefined
    if (!this.props.export_keys[ExportKey.Land])
      delete new_state.battle[DefinitionType.Land]
    if (!this.props.export_keys[ExportKey.Naval])
      delete new_state.battle[DefinitionType.Naval]
    if (!this.props.export_keys[ExportKey.Land] && !this.props.export_keys[ExportKey.Naval])
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
      json.countries = json.countries || (reset_missing && countriesState)
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
