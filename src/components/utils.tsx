import React from 'react'
import { Image, Table, Dropdown } from 'semantic-ui-react'

import { DefinitionType } from '../base_definition'
import { values } from '../utils'

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


const modes = values(DefinitionType)

export const renderModeDropdown = (value: DefinitionType, onChange: (mode: DefinitionType) => void, disabled?: boolean): JSX.Element => (
  <Dropdown text={value} value={value} selection disabled={disabled}>
    <Dropdown.Menu>
      {
        modes.map(mode => (
          <Dropdown.Item value={mode} text={mode} key={mode} active={value === mode}
            onClick={() => onChange(mode)}
          />
        ))
      }
    </Dropdown.Menu>
  </Dropdown>
)
