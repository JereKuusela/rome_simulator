import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import PaddedRow from './Utils/PaddedRow'
import { Input } from './Utils/Inputs'
import Headers from './Utils/Headers'

import { ValuesType, formatAttribute } from 'types'
import { getValue, explainShort, DefinitionValues, calculateValue } from 'definition_values'

interface IProps<D extends DefinitionValues<T>, T extends string> {
  customValueKey: string
  definition: D
  attributes: T[]
  onChange: (key: string, attribute: T, value: number) => void
}

// Display component for showing and changing some country details.
export default class TableAttributes<D extends DefinitionValues<T>, T extends string> extends Component<IProps<D, T>> {
  headers = ['Attribute', 'Value', 'Custom value', 'Explained']

  CELLS = 4

  render() {
    const { attributes } = this.props
    return (
      <Table celled unstackable>
        <Headers values={this.headers} />
        <Table.Body>{attributes.map(this.renderRow)}</Table.Body>
      </Table>
    )
  }

  renderRow = (attribute: T) => {
    const { definition, customValueKey, onChange } = this.props
    const baseValue = getValue(ValuesType.Base, definition, attribute, customValueKey)
    const value = calculateValue(definition, attribute)

    return (
      <PaddedRow key={attribute} cells={this.CELLS}>
        {attribute}
        {formatAttribute(value, attribute)}
        <Input value={String(baseValue)} onChange={value => onChange(customValueKey, attribute, Number(value))} />
        {explainShort(definition, attribute)}
      </PaddedRow>
    )
  }
}
