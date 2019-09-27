import React from 'react'
import { Image, Table } from 'semantic-ui-react'

export const renderImages = (images: Set<string>): JSX.Element[] => {
  const arr = Array.from(images)
  return arr.map(image => <Image key={image} src={image} avatar />)
}

export const renderHeaders = (headers: string[]) => (
  <Table.Header>
    <Table.Row>
      {headers.map(renderHeader)}
    </Table.Row>
  </Table.Header>
)

const renderHeader = (header: string) => (
  <Table.HeaderCell key={header}>
    {header}
  </Table.HeaderCell>
)
