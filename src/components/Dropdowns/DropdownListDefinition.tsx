import React, { Component } from 'react'
import { SiteSettings, ListDefinition } from 'types'
import DropdownTable from './DropdownTable'
import ListModifier from 'components/Utils/ListModifier'

type IProps = {
  value: string
  values: ListDefinition[]
  settings: SiteSettings
  onSelect: (key: string) => void
  type: string
}

export default class DropdownListDefinition extends Component<IProps> {

  getContent = (item: ListDefinition, search: string) => (item.name.toLowerCase().includes(search.toLowerCase()) ? [
    item.name,
    <ListModifier
      name={null}
      modifiers={item.modifiers}
    />
  ] : null)

  isActive = (item: ListDefinition) => item.key === this.props.value

  getValue = (item: ListDefinition) => item.key

  getText = (item: ListDefinition) => item.name

  getHeaders = () => [this.props.type, 'Effect']

  render() {
    const { value, values, onSelect, settings, type } = this.props
    return (
      <DropdownTable value={value} values={values}
        headers={this.getHeaders()}
        getContent={this.getContent}
        isActive={this.isActive}
        getValue={this.getValue}
        getText={this.getText}
        onSelect={onSelect}
        settings={settings}
        clearable
        search
        placeholder={'Select ' + type.toLowerCase()}
      />
    )
  }
}
