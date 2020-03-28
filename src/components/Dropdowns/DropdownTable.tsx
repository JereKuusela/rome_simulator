import React, { Component } from 'react'
import { Dropdown, Table } from 'semantic-ui-react'
import AttributeImage from '../Utils/AttributeImage'

interface IProps<T extends string> {
  value: T
  values: { type: T }[]
  headers: string[]
  getContent: (value: any) => (string | number | JSX.Element)[]
  onSelect: (type: T) => void
}

export default class DropdownTable<T extends string> extends Component<IProps<T>> {

  getHeader = () => (
    <Table.Header>
      {this.props.headers.map(header => <Table.HeaderCell><AttributeImage attribute={header} /></Table.HeaderCell>)}
    </Table.Header>
  )

  getContent = (value: { type: T }) => (
    <Table.Row onClick={() => this.props.onSelect(value.type)} active={this.props.value === value.type}>
      {this.props.getContent(value).map(cell => <Table.Cell>{cell}</Table.Cell>)}
    </Table.Row>
  )

  render() {
    const { value, values } = this.props
    return (
      <Dropdown text={value} value={value} scrolling>
        <Dropdown.Menu>
          <Table selectable celled>
            {this.getHeader()}
            {values.map(this.getContent)}
          </Table>
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
