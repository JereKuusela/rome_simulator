import React, { Component } from 'react'
import { Table, Grid, Checkbox, Header, Input } from 'semantic-ui-react'

import { Setting, parameterToDescription, SimulationSpeed, DisciplineValue } from 'types'
import { toArr, values } from 'utils'
import SimpleDropdown from './Dropdowns/SimpleDropdown'
import { getDefaultLandSettings, getDefaultSiteSettings } from 'data'

type Values = string | number | boolean

type IProps<T extends Setting> = {
  settings: { [key in T]: Values }
  onChange: (key: T, str: Values) => void
}

const defaultSettings = { ...getDefaultLandSettings(), ...getDefaultSiteSettings() }

/** Component for showing and changing settings.  */
export default class GridSettings<T extends Setting> extends Component<IProps<T>> {

  headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  render() {
    const { settings, onChange } = this.props
    return (
      <Grid padded celled>
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
  }
  renderSetting = (key: T, value: Values, onChange: (key: T, str: Values) => void) => {
    if (typeof value === 'number') {
      return (
        <Input
          size='mini'
          style={{ width: 60 }}
          defaultValue={value}
          placeholder={defaultSettings[key]}
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
        <SimpleDropdown
          value={value}
          style={{ width: 100 }}
          values={values(SimulationSpeed)}
          onChange={value => onChange(key, value)}
        />
      )
    }
    if (key === Setting.AttributeDiscipline) {
      return (
        <SimpleDropdown
          value={value}
          style={{ width: 200 }}
          values={values(DisciplineValue)}
          onChange={value => onChange(key, value)}
        />
      )
    }
    return null
  }

  onInputChange = (key: T, str: string, onChange: (key: T, value: number) => void) => {
    const value = str.length ? +str : Number(defaultSettings[key])
    if (isNaN(value))
      return
    onChange(key, value)
  }
}
