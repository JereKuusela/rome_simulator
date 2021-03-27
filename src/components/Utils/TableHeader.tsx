import React from 'react'
import { Table } from 'semantic-ui-react'
import AttributeImage from './AttributeImage'

const TableHeader = ({ headers }: { headers: readonly string[] }) => {
  return (
    <Table.Header>
      <Table.Row>
        {headers.map(header => (
          <Table.Cell key={header}>
            <AttributeImage attribute={header} />
          </Table.Cell>
        ))}
      </Table.Row>
    </Table.Header>
  )
}

export default TableHeader
