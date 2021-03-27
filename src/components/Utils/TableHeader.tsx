import React from 'react'
import { Table } from 'semantic-ui-react'
import AttributeImage from './AttributeImage'

const TableHeader = ({ headers }: { headers: readonly string[] }) => {
  return (
    <Table.Header>
      <Table.Row>
        {headers.map(header => (
          <Table.HeaderCell key={header}>
            <AttributeImage attribute={header} />
          </Table.HeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
  )
}

export default TableHeader
