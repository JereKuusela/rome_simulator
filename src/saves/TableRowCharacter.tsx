import AttributeImage from 'components/Utils/AttributeImage'
import { traitsIR } from 'data'
import React from 'react'
import { Table } from 'semantic-ui-react'
import { GeneralAttribute } from 'types'
import { SaveCharacter } from './types'

const RenderAttribute = ({ attribute, character }: { attribute: GeneralAttribute; character: SaveCharacter }) => (
  <>
    <AttributeImage attribute={attribute} />
    {' ' + character.attributes[attribute]}
  </>
)

const TableRowCharacter = ({ character }: { character: SaveCharacter }) => {
  return (
    <Table.Row>
      <Table.Cell>{character.id}</Table.Cell>
      <Table.Cell>{character.name}</Table.Cell>
      <Table.Cell>{character.countryName}</Table.Cell>
      <Table.Cell>{character.age}</Table.Cell>
      <Table.Cell>{character.gender}</Table.Cell>
      <Table.Cell>
        <RenderAttribute character={character} attribute={GeneralAttribute.Martial} />
      </Table.Cell>
      <Table.Cell>
        <RenderAttribute character={character} attribute={GeneralAttribute.Finesse} />
      </Table.Cell>
      <Table.Cell>
        <RenderAttribute character={character} attribute={GeneralAttribute.Charisma} />
      </Table.Cell>
      <Table.Cell>
        <RenderAttribute character={character} attribute={GeneralAttribute.Zeal} />
      </Table.Cell>
      <Table.Cell>{character.traits.map(key => traitsIR.get(key)?.name).join(', ')}</Table.Cell>
    </Table.Row>
  )
}

export default TableRowCharacter
