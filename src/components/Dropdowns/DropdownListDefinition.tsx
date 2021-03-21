import React, { Component } from 'react'
import { SiteSettings, DataEntry } from 'types'
import DropdownTable from './DropdownTable'
import ListModifier from 'components/Utils/ListModifier'

type IProps = {
  value: string
  values: DataEntry[]
  settings?: SiteSettings
  onSelect: (key: string) => void
  type: string
}

export default class DropdownListDefinition extends Component<IProps> {
  getContent = (item: DataEntry, search: string) =>
    item.name.toLowerCase().includes(search.toLowerCase())
      ? [item.name, <ListModifier name={null} modifiers={item.modifiers} />]
      : null

  isActive = (item: DataEntry) => item.key === this.props.value

  getValue = (item: DataEntry) => item.key

  getText = (item: DataEntry) => item.name

  getHeaders = () => [this.props.type, 'Effect']

  render() {
    const { value, values, onSelect, settings, type } = this.props
    return (
      <DropdownTable
        value={value}
        values={values}
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
