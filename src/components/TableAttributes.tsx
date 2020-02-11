import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import PaddedRow from './Utils/PaddedRow'
import Input from './Utils/Input'
import Headers from './Utils/Headers'

import { ValuesType } from 'types'
import { getValue, explainShort, DefinitionValues, calculateValue } from 'definition_values'
import { formatAttribute } from 'formatters'

interface IProps<D extends DefinitionValues<T>, T extends string> {
  custom_value_key: string
  definition: D
  attributes: T[]
  onChange: (key: string, attribute: T, value: number) => void
}

// Display component for showing and changing some country details.
export default class TableAttributes<D extends DefinitionValues<T>, T extends string> extends Component<IProps<D, T>> {

  readonly headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  readonly CELLS = 4

  render() {
    const { attributes } = this.props
    return (
      <Table celled unstackable>
        <Headers values={this.headers} />
        <Table.Body>
          {attributes.map(this.renderRow)}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (attribute: T) => {
    const { definition, custom_value_key, onChange } = this.props
    const base_value = getValue(ValuesType.Base, definition, attribute, custom_value_key)
    const value = calculateValue(definition, attribute)

    return (
      <PaddedRow key={attribute} cells={this.CELLS}>
        {attribute}
        {formatAttribute(value, attribute)}
        <Input value={String(base_value)} onChange={value => onChange(custom_value_key, attribute, Number(value))} />
        {explainShort(definition, attribute)}
      </PaddedRow>
    )
  }
}
