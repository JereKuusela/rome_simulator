import ListModifier from 'components/Utils/ListModifier'
import React from 'react'
import { Table } from 'semantic-ui-react'
import { SelectionType, ListDefinition, Modifier } from 'types'
import { mapRange, ObjSet } from 'utils'

type Props = {
  selections: ObjSet<string> | undefined
  type: SelectionType
  items: ListDefinition[]
  columns: number
  onClick: (enabled: boolean) => (type: SelectionType, key: string) => void
  disabled?: boolean
  usePercentPadding?: boolean
}

export const TableModifierList = ({
  selections,
  columns,
  disabled,
  items,
  onClick,
  type,
  usePercentPadding
}: Props) => {
  items = items.filter(entity => entity.modifiers.length)
  const rows = Math.ceil(items.length / columns)
  return (
    <Table celled unstackable fixed style={{ margin: 0 }}>
      <Table.Body>
        {mapRange(rows, number => number).map(row => (
          <Table.Row key={row}>
            {mapRange(columns, number => number).map(column => {
              const index = row * columns + column
              const entity = items[index]
              if (!entity) return <Table.Cell key={index}></Table.Cell>
              const modifiers = entity.modifiers
              const key = entity.key
              return renderCell(
                type,
                key,
                entity.name,
                selections ? selections[key] : false,
                modifiers,
                onClick,
                usePercentPadding ? PERCENT_PADDING : undefined,
                disabled
              )
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const PERCENT_PADDING = '\u00a0\u00a0\u00a0\u00a0'
const CELL_PADDING = '.78571429em .78571429em'
const renderCell = (
  type: SelectionType,
  key: string,
  name: string | null,
  enabled: boolean,
  modifiers: Modifier[],
  onClick: (enabled: boolean) => (type: SelectionType, key: string) => void,
  padding?: string,
  disabled?: boolean,
  width?: number
) => (
  <Table.Cell
    disabled={disabled}
    key={key}
    positive={enabled}
    selectable
    colSpan={width || 1}
    onClick={() => onClick(enabled)(type, key)}
    style={{ padding: CELL_PADDING }}
  >
    <ListModifier name={name} modifiers={modifiers} padding={padding} />
  </Table.Cell>
)
