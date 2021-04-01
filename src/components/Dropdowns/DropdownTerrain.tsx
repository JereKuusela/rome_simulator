import React, { Component } from 'react'
import { TerrainType, TerrainData, TerrainCalc, CombatSharedSettings } from 'types'
import { calculateValue } from 'data_values'
import DropdownTable from './DropdownTable'
import StyledNumber from 'components/Utils/StyledNumber'
import { addSign } from 'formatters'
import LabelItem from 'components/Utils/LabelUnit'

type IProps = {
  value: TerrainType
  values: TerrainData[]
  onSelect: (type: TerrainType) => void
  settings: CombatSharedSettings
}

export default class DropdownTerrain extends Component<IProps> {
  getContent = (terrain: TerrainData) => [
    <LabelItem item={terrain} />,
    <StyledNumber value={calculateValue(terrain, TerrainCalc.Roll)} formatter={addSign} />,
    <StyledNumber value={calculateValue(terrain, TerrainCalc.CombatWidth)} formatter={addSign} />
  ]

  isActive = (item: TerrainData) => item.type === this.props.value

  getValue = (item: TerrainData) => item.type
  getText = (item: TerrainData) => item.type

  headers = ['Terrain', 'Attacker roll', 'Combat width']

  render() {
    const { value, values, onSelect, settings } = this.props
    return (
      <DropdownTable
        value={value}
        values={values}
        headers={this.headers}
        getContent={this.getContent}
        onSelect={onSelect}
        settings={settings}
        isActive={this.isActive}
        getValue={this.getValue}
        getText={this.getText}
      />
    )
  }
}
