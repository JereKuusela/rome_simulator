import React, { Component } from 'react'
import { Grid, TextArea, Checkbox, List, Header, Button, Input } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, resetMissing, restoreBaseTactics, restoreBaseTerrains, restoreBaseUnits, setIds } from 'state'
import { values, keys } from 'utils'
import { ExportKey } from 'types'
import { exportState, saveToFile } from 'managers/transfer_manager'
import ConfirmationButton from 'components/ConfirmationButton'
import { setExportKey, setResetMissing, importState } from 'reducers'


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

  render() {
    const json = exportState(this.props.state, this.props.export_keys)
    if (this.last_data !== json) {
      // Hack to make data editable manually or when exported settings change.
      // This could probably be moved to trigger when export keys change?
      this.last_data = json
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
            <Header>Reset</Header>
            <List>
              <List.Item>
                Reset all data (battle, countries, units, tactics, terrains, settings)
              </List.Item>
              <List.Item>
              <ConfirmationButton
                negative text='Reset'
                message='Do you really want to reset all data?'
                onConfirm={() => this.props.importState('', true)}
              />
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
          checked={this.props.export_keys[key]}
          onChange={() => this.props.setExportKey(key, !this.props.export_keys[key])}
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
      json.tactics = json.tactics && restoreBaseTactics(json.tactics)
      json.terrains = json.terrains && restoreBaseTerrains(json.terrains)
      json.units = json.units && restoreBaseUnits(json.units)
      json.battle = json.battle && setIds(json.battle)
      if (reset_missing)
        resetMissing(json)
      keys(json).filter(key => !json[key]).forEach(key => delete json[key])
      dispatch(importState(json, reset_missing))
    }
    catch (err) {
      console.error(err)
    }
  }
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Transfer)
