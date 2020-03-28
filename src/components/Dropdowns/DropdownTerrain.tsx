import React, { Component } from 'react'
import { TerrainType, Terrain, TerrainCalc } from 'types'
import { calculateValue } from 'definition_values'
import DropdownTable from './DropdownTable'
import StyledNumber from 'components/Utils/StyledNumber'
import { addSign } from 'formatters'
import LabelItem from 'components/Utils/LabelUnit'

interface IProps {
  value: TerrainType
  values: Terrain[]
  onSelect: (type: TerrainType) => void
}

export default class DropdownTerrain extends Component<IProps> {

  getContent = (terrain: Terrain) => ([
    <LabelItem item={terrain} />,
    <StyledNumber
      value={calculateValue(terrain, TerrainCalc.Roll)}
      formatter={addSign}
    />
  ])

  headers = ['Terrain', 'Attacker roll']

  render() {
    const { value, values, onSelect } = this.props
    return (
      <DropdownTable value={value} values={values}
        headers={this.headers}
        getContent={this.getContent}
        onSelect={onSelect}
      />
    )
  }
}
