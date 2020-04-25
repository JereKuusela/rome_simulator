import React, { Component } from 'react'
import { TerrainType, TerrainDefinition, TerrainCalc, SiteSettings } from 'types'
import { calculateValue } from 'definition_values'
import DropdownTable from './DropdownTable'
import StyledNumber from 'components/Utils/StyledNumber'
import { addSign } from 'formatters'
import LabelItem from 'components/Utils/LabelUnit'

type IProps = {
  value: TerrainType
  values: TerrainDefinition[]
  onSelect: (type: TerrainType) => void
  settings: SiteSettings
}

export default class DropdownTerrain extends Component<IProps> {

  getContent = (terrain: TerrainDefinition) => ([
    <LabelItem item={terrain} />,
    <StyledNumber
      value={calculateValue(terrain, TerrainCalc.Roll)}
      formatter={addSign}
    />
  ])

  isActive = (item: TerrainDefinition) => item.type === this.props.value

  getValue = (item: TerrainDefinition) => item.type


  headers = ['Terrain', 'Attacker roll']

  render() {
    const { value, values, onSelect, settings } = this.props
    return (
      <DropdownTable value={value} values={values}
        headers={this.headers}
        getContent={this.getContent}
        onSelect={onSelect}
        settings={settings}
        isActive={this.isActive}
        getValue={this.getValue}
      />
    )
  }
}
