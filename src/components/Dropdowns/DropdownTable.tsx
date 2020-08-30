import React, { Component } from 'react'
import { Dropdown, Table } from 'semantic-ui-react'
import AttributeImage from '../Utils/AttributeImage'
import { SiteSettings } from 'types'

interface IProps<T extends string, E> {
  value: T
  trigger?: React.ReactNode
  values: E[]
  headers: string[]
  getContent: (value: E, search: string) => (string | number | JSX.Element)[] | null
  isPositive?: (value: E) => boolean
  isNegative?: (value: E) => boolean
  getText?: (value: E) => string
  isActive: (value: E) => boolean
  getValue: (value: E) => T
  onSelect: (type: T) => void
  settings: SiteSettings
  clearable?: boolean
  search?: boolean
  placeholder?: string
  absolute?: boolean
  width?: number
}

type IState = {
  search: string
  open: boolean
}

export default class DropdownTable<T extends string, E> extends Component<IProps<T, E>, IState> {

  constructor(props: IProps<T, E>) {
    super(props)
    this.state = { search: '', open: false }
  }

  getHeader = () => (
    <Table.Header>
      <Table.Row>
        {this.props.headers.map(header => <Table.HeaderCell key={header}><AttributeImage attribute={header} settings={this.props.settings} /></Table.HeaderCell>)}
      </Table.Row>
    </Table.Header>
  )

  search = (_: any, data: any) => this.setState({ search: data.searchQuery })

  onOpen = () => this.setState({ search: '', open: true })
  onClose = () => this.setState({ search: '', open: false })

  getContent = (item: E, index: number) => {
    const { getContent, isPositive, isNegative, isActive } = this.props
    const content = getContent(item, this.state.search)
    if (!content)
      return null
    return (
      <Table.Row key={index} onClick={() => this.onClick(item)} active={isActive(item)} positive={isPositive && isPositive(item)} negative={isNegative && isNegative(item)}>
        {content.map((cell, index) => <Table.Cell key={index}>{cell}</Table.Cell>)}
      </Table.Row>
    )
  }

  onClick = (item: E) => {
    this.props.onSelect(this.props.getValue(item))
    this.setState({ open: false, search: '' })
  }
  onChange = () => {
    this.props.onSelect('' as T)
    this.setState({ open: false, search: '' })
  }
  render() {
    const { value, values, headers, trigger, width, clearable, getText, search, placeholder, absolute } = this.props
    const selected = values.find(this.props.isActive)
    const text = trigger ? undefined : selected && getText ? getText(selected) : ''
    const style = { minWidth: width ?? 170, maxWidth: width ?? 170 }
    let classNames = []
    if (absolute)
      classNames.push('absolute')
    if (!trigger)
      classNames.push('selection')
    return (
      //<span style={{ minWidth: 180, maxWidth: 180, display: 'inline-block', verticalAlign: 'top' }}>
      <Dropdown open={this.state.open} clearable={clearable} onChange={this.onChange} search={search} searchQuery={this.state.search} onSearchChange={this.search} onOpen={this.onOpen} onBlur={this.onClose}
        text={text} value={value} scrolling trigger={trigger} className={classNames.join(' ')} placeholder={placeholder} style={style}>
        <Dropdown.Menu>
          <Table selectable celled>
            {headers.length ? this.getHeader() : null}
            <Table.Body>
              {values.map(this.getContent)}
            </Table.Body>
          </Table>
        </Dropdown.Menu>
      </Dropdown>
      //</span>
    )
  }
}
