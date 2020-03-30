import React, { Component } from 'react'
import { Dropdown, Table } from 'semantic-ui-react'
import AttributeImage from '../Utils/AttributeImage'

interface IProps<T extends string> {
  value: T
  trigger?: React.ReactNode
  values: { type: T }[]
  headers: string[]
  getContent: (value: any) => (string | number | JSX.Element)[]
  onSelect: (type: T) => void
}

export default class DropdownTable<T extends string> extends Component<IProps<T>> {

  getHeader = () => (
    <Table.Header>
      <Table.Row>
        {this.props.headers.map(header => <Table.HeaderCell key={header}><AttributeImage attribute={header} /></Table.HeaderCell>)}
      </Table.Row>
    </Table.Header>
  )

  getContent = (value: { type: T }) => (
    <Table.Row key={value.type} onClick={() => this.props.onSelect(value.type)} active={this.props.value === value.type}>
      {this.props.getContent(value).map((cell, index) => <Table.Cell key={index}>{cell}</Table.Cell>)}
    </Table.Row>
  )

  render() {
    const { value, values, headers, trigger } = this.props
    return (
      <Dropdown text={value} value={value} scrolling trigger={trigger}>
        <Dropdown.Menu>
          <Table selectable celled>
            {headers.length ? this.getHeader() : null}
            <Table.Body>
              {values.map(this.getContent)}
            </Table.Body>
          </Table>
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
