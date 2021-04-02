import { traitsIR } from 'data'
import { toPercent } from 'formatters'
import React, { memo } from 'react'
import { Table } from 'semantic-ui-react'
import { CharacterAttribute } from 'types'
import { getPregnancyString } from './manager'
import { SaveCharacter } from './types'

type RenderAttributeProps = {
  attribute: CharacterAttribute
  character: SaveCharacter
  renderer?: (value: number) => string
}

const RenderAttribute = ({ attribute, character, renderer }: RenderAttributeProps) => (
  <span>{renderer ? renderer(character[attribute]) : character[attribute]}</span>
)

const healthString = (health: number, monthly: number) => {
  if (monthly) return `${toPercent(health / 100.0)} (${toPercent(monthly)})`
  return toPercent(health / 100.0)
}

const TableRowCharacter = ({ character }: { character: SaveCharacter }) => {
  return (
    <Table.Row>
      <Table.Cell>{character.id}</Table.Cell>
      <Table.Cell>{character.name}</Table.Cell>
      <Table.Cell>{character.countryName}</Table.Cell>
      <Table.Cell>{character.gender}</Table.Cell>
      <Table.Cell>
        <RenderAttribute character={character} attribute={CharacterAttribute.Age} />
      </Table.Cell>
      <Table.Cell>
        <RenderAttribute
          character={character}
          attribute={CharacterAttribute.Health}
          renderer={health => healthString(health, character.monthlyHealth)}
        />
      </Table.Cell>
      <Table.Cell>
        <RenderAttribute character={character} attribute={CharacterAttribute.Fertility} renderer={toPercent} />
      </Table.Cell>
      <Table.Cell>
        <RenderAttribute character={character} attribute={CharacterAttribute.Martial} />
      </Table.Cell>
      <Table.Cell>
        <RenderAttribute character={character} attribute={CharacterAttribute.Finesse} />
      </Table.Cell>
      <Table.Cell>
        <RenderAttribute character={character} attribute={CharacterAttribute.Charisma} />
      </Table.Cell>
      <Table.Cell>
        <RenderAttribute character={character} attribute={CharacterAttribute.Zeal} />
      </Table.Cell>
      <Table.Cell>{character.traits.map(key => traitsIR.get(key)?.name).join(', ')}</Table.Cell>
      <Table.Cell>{getPregnancyString(character.pregnant)}</Table.Cell>
    </Table.Row>
  )
}

export default memo(TableRowCharacter)
