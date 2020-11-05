import React, { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import { useSelectedTerrains, useSiteSettings, useTerrainsAtLocation } from 'state'
import IconDice from 'images/chance.png'
import StyledNumber from 'components/Utils/StyledNumber'
import { Terrain, TerrainCalc, TerrainType } from 'types'
import { calculateValue } from 'definition_values'
import { addSign } from 'formatters'
import { selectTerrain } from 'reducers'
import DropdownTerrain from 'components/Dropdowns/DropdownTerrain'

/**
 * Table with row types and flank sizes.
 */
const TerrainSelector = (): JSX.Element => {
  const terrains = useSelectedTerrains()
  return (
    <Table celled unstackable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Location</Table.HeaderCell>
          <Table.HeaderCell>Terrain</Table.HeaderCell>
          <Table.HeaderCell>Roll modifier</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {terrains.map((terrain, index) => (
          <RenderTerrain terrain={terrain} index={index} key={index} />
        ))}
      </Table.Body>
    </Table>
  )
}

const RenderTerrain = ({ terrain, index }: { terrain: Terrain; index: number }) => {
  const dispatch = useDispatch()
  const terrains = useTerrainsAtLocation(terrain.location)
  const settings = useSiteSettings()

  const handleSelect = useCallback(
    (type: TerrainType): void => {
      dispatch(selectTerrain(index, type))
    },
    [dispatch, index]
  )
  const roll = useMemo(() => calculateValue(terrain, TerrainCalc.Roll), [terrain])
  return (
    <Table.Row key={terrain.location}>
      <Table.Cell>{terrain.location}</Table.Cell>
      <Table.Cell>
        <DropdownTerrain value={terrain.type} values={terrains} onSelect={handleSelect} settings={settings} />
      </Table.Cell>
      <Table.Cell>
        <Image src={IconDice} avatar />
        <StyledNumber value={roll} formatter={addSign} />
      </Table.Cell>
    </Table.Row>
  )
}

export default TerrainSelector
