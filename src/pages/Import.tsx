import React, { Component } from 'react'
import { Container, Grid, TextArea, Checkbox, List, Header, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ExportKey, setResetMissing } from '../store/settings'
import { importState } from '../store/transfer'
import { transformLand, transformSettings, transformTactics, transformTerrains, transformUnits} from '../store'

class Transfer extends Component<IProps> {

  readonly attributes = Object.keys(ExportKey).map(k => ExportKey[k as any]) as ExportKey[]

  data = ''

  render() {
    return (
      <Container>
        <Grid>
          <Grid.Row columns='2'>
            <Grid.Column>
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
                  <Button primary onClick={() => this.props.importState(this.data, this.props.reset_missing)}>Import</Button>
                </List.Item>
              </List>
            </Grid.Column>
            <Grid.Column >
              <TextArea rows='30' style={{ width: '100%' }}
                onChange={(_, data) => this.data = String(data.value)}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  state: state,
  export_keys: state.settings.export_keys,
  reset_missing: state.settings.reset_missing
})

const mapDispatchToProps = (dispatch: any) => ({
  setResetMissing: (value: boolean) => dispatch(setResetMissing(value)),
  importState: (data: string, reset_missing: boolean) => {
    try {
      let json = JSON.parse(data)
      json.land = json.land && transformLand(json.land)
      json.settings = json.settings && transformSettings(json.settings)
      json.tactics = json.tactics && transformTactics(json.tactics)
      json.terrains = json.terrains && transformTerrains(json.terrains)
      json.units = json.units && transformUnits(json.units)
      Object.keys(json).forEach(function (key) {
        if(json[key] === undefined) delete json[key];
    });
      dispatch(importState(json, reset_missing))
    }
    catch (err) {
      console.error(err)
    }
  }
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Transfer)
