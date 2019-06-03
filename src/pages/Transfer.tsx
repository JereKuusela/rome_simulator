import React, { Component } from 'react'
import { Container, Grid, TextArea, Checkbox, List } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ExportKey, setExportKey } from '../store/settings'

class Transfer extends Component<IProps> {

  readonly attributes = Object.keys(ExportKey).map(k => ExportKey[k as any]) as ExportKey[]


  render() {
    const json = JSON.stringify(this.props.state, this.filterKeys, 2)
    return (
      <Container>
        <Grid>
          <Grid.Row columns='2'>
            <Grid.Column>
              <List>
                {this.attributes.map(value => this.renderCheckbox(value))}
              </List>
            </Grid.Column>
            <Grid.Column >
              <TextArea value={json} rows='30' style={{ width: '100%' }} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container >
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

  filterKeys = (key: string, value: any) => {
    if (key === '_persist')
      return undefined
    if (key === 'units' && !this.props.export_keys.get(ExportKey.Units))
      return undefined
    if (key === 'terrains' && !this.props.export_keys.get(ExportKey.Terrains))
      return undefined
    if (key === 'tactics' && !this.props.export_keys.get(ExportKey.Tactics))
      return undefined
    if (key === 'land' && !this.props.export_keys.get(ExportKey.Army))
      return undefined
    if (key === 'settings' && !this.props.export_keys.get(ExportKey.Settings))
      return undefined
    return value
  }
}

const mapStateToProps = (state: AppState) => ({
  state: state,
  export_keys: state.settings.export_keys
})

const mapDispatchToProps = (dispatch: any) => ({
  setExportKey: (key: ExportKey, value: boolean) => dispatch(setExportKey(key, value))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Transfer)
