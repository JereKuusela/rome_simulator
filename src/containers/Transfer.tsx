import React, { Component } from 'react'
import { Grid, TextArea, Checkbox, List, Header, Button, Input } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, resetMissing, restoreDefaultTactics, restoreDefaultTerrains, restoreDefaultUnits, restoreDefaultSettings } from 'state'
import { values, keys } from 'utils'
import { ExportKey } from 'types'
import { exportState, saveToFile } from 'managers/transfer'
import { setExportKey, setResetMissing, importState } from 'reducers'


interface IState {
  data: string
}

class Transfer extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { data: '' }
  }

  lastData = ''

  readonly attributes = values(ExportKey)

  render() {
    const json = exportState(this.props.state, this.props.exportKeys)
    if (this.lastData !== json) {
      // Hack to make data editable manually or when exported settings change.
      // This could probably be moved to trigger when export keys change?
      this.lastData = json
      this.setState({ data: json })
    }
    return (
      <Grid>
        <Grid.Row columns='2'>
          <Grid.Column>
            <Header>Export</Header>
            <List>
              <List.Item>
                1. Select which parts to export (resets any manual changes)
                </List.Item>
              {this.attributes.map(value => this.renderCheckbox(value))}
              <List.Item>
                2a. <Button primary onClick={() => saveToFile(this.state.data)}>Export to file</Button>
              </List.Item>
              <List.Item>
                2b. Copy paste the data from the text box
                </List.Item>
            </List>
            <Header>Import</Header>
            <List>
              <List.Item>
                1a. <Input type='file' onChange={event => this.loadContent(event.target.files![0])} />
              </List.Item>
              <List.Item>
                1b. Copy paste the data to the text box
                </List.Item>
              <List.Item>
                2. Select how to handle missing data
                </List.Item>
              <List.Item>
                <Checkbox
                  toggle
                  label='Reset missing data'
                  checked={this.props.resetMissing}
                  onChange={() => this.props.setResetMissing(!this.props.resetMissing)}
                />
              </List.Item>
              <List.Item>
                3. Push the button
              </List.Item>
              <List.Item>
                <Button primary onClick={() => this.props.importState(this.state.data, this.props.resetMissing)}>Import</Button>
              </List.Item>
            </List>
            <Header>Reset</Header>
            <List>
              <List.Item>
                Reset all data (battle, countries, units, tactics, terrains, settings)
              </List.Item>
              <List.Item>
                <Button negative onClick={() => this.props.importState('', true)}>Reset</Button>
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
    )
  }

  renderCheckbox = (key: ExportKey): JSX.Element => {
    return (
      <List.Item key={key}>
        <Checkbox
          key={key}
          toggle
          label={key}
          checked={this.props.exportKeys[key]}
          onChange={() => this.props.setExportKey(key, !this.props.exportKeys[key])}
        />
      </List.Item>)
  }

  loadContent = (file: File) => {
    const blob = file as any
    blob.text().then((data: string) => this.setState({ data }))
  }
}

const mapStateToProps = (state: AppState) => ({
  state: state,
  exportKeys: state.transfer.exportKeys,
  resetMissing: state.transfer.resetMissing
})

const mapDispatchToProps = (dispatch: any) => ({
  setExportKey: (key: ExportKey, value: boolean) => dispatch(setExportKey(key, value)),
  setResetMissing: (value: boolean) => dispatch(setResetMissing(value)),
  importState: (data: string, doResetMissing: boolean) => {
    try {
      if (!data)
        data = '{}'
      let json = JSON.parse(data)
      json.transfer = undefined
      json.ui = undefined
      json.tactics = json.tactics && restoreDefaultTactics(json.tactics)
      json.terrains = json.terrains && restoreDefaultTerrains(json.terrains)
      json.units = json.units && restoreDefaultUnits(json.units)
      json.units = json.settings && restoreDefaultSettings(json.settings)
      if (doResetMissing)
        resetMissing(json)
      keys(json).filter(key => !json[key]).forEach(key => delete json[key])
      dispatch(importState(json, doResetMissing))
    }
    catch (err) {
      console.error(err)
    }
  }
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Transfer)
