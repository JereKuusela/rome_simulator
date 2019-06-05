import React, { Component } from 'react'
import { Container, Grid, TextArea, Checkbox, List, Header, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ExportKey, setResetMissing, setExportKey } from '../store/transfer'
import { importState } from '../store/transfer'
import { transformGlobalStats, transformLand, transformTactics, transformTerrains, transformUnits } from '../store/transforms'


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

  render() {
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

  renderCheckbox = (key: ExportKey) => {
    return (
      <List.Item>
        <Checkbox
          key={key}
          toggle
          label={key}
          disabled={key === ExportKey.History}
          checked={this.props.export_keys.get(key)}
          onChange={() => this.props.setExportKey(key, !this.props.export_keys.get(key))}
        />
      </List.Item>)
  }

  filterKeys = (state: AppState) => {
    let new_state: any = { ...state }
    new_state._persist = undefined
    new_state.transfer = undefined
    if (!this.props.export_keys.get(ExportKey.Units))
      new_state.units = undefined
    if (!this.props.export_keys.get(ExportKey.Units))
      new_state.global_stats = undefined
    if (!this.props.export_keys.get(ExportKey.Terrains))
      new_state.terrains = undefined
    if (!this.props.export_keys.get(ExportKey.Tactics))
      new_state.tactics = undefined
    if (!this.props.export_keys.get(ExportKey.Army))
      new_state.land = undefined
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
      let json = JSON.parse(data)
      json.transfer = undefined
      json.land = json.land && transformLand(json.land)
      json.tactics = json.tactics && transformTactics(json.tactics)
      json.terrains = json.terrains && transformTerrains(json.terrains)
      json.units = json.units && transformUnits(json.units)
      json.global_stats = json.global_stats && transformGlobalStats(json.global_stats)
      Object.keys(json).filter(key => json[key] === undefined).forEach(key => delete json[key])
      dispatch(importState(json, reset_missing))
    }
    catch (err) {
      console.error(err)
    }
  }
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Transfer)
