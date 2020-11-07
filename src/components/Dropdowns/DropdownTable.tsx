import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Dropdown, DropdownOnSearchChangeData, Table } from 'semantic-ui-react'
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

const DropdownTable = <T extends string, E>(props: IProps<T, E>): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const {
    value,
    values,
    headers,
    trigger,
    width,
    clearable,
    getText,
    search,
    placeholder,
    absolute,
    settings,
    isActive,
    onSelect
  } = props
  const selected = values.find(isActive)
  const text = trigger ? undefined : selected && getText ? getText(selected) : ''
  const style = { minWidth: width ?? 170, maxWidth: width ?? 170 }
  const classNames = []
  if (absolute) classNames.push('absolute')
  if (!trigger) classNames.push('selection')

  const handleSearch = useCallback((_, data: DropdownOnSearchChangeData) => setSearchQuery(data.searchQuery), [])
  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  useEffect(() => setSearchQuery(''), [open])

  const handleChange = useCallback(() => {
    onSelect('' as T)
    handleClose()
  }, [onSelect, handleClose])

  return (
    <Dropdown
      open={open}
      clearable={clearable}
      onChange={handleChange}
      search={search}
      searchQuery={searchQuery}
      onSearchChange={handleSearch}
      onOpen={handleOpen}
      onBlur={handleClose}
      text={text}
      value={value}
      scrolling
      trigger={trigger}
      className={classNames.join(' ')}
      placeholder={placeholder}
      style={style}
    >
      <Dropdown.Menu>
        <Table selectable celled>
          {headers.length ? <Header headers={headers} settings={settings} /> : null}
          <Table.Body>
            {values.map((item, index) => (
              <Content
                key={index}
                searchQuery={searchQuery}
                onClose={handleClose}
                index={index}
                item={item}
                {...props}
              />
            ))}
          </Table.Body>
        </Table>
      </Dropdown.Menu>
    </Dropdown>
  )
}

const Header = ({ headers, settings }: { headers: string[]; settings: SiteSettings }) => (
  <Table.Header>
    <Table.Row>
      {headers.map(header => (
        <Table.HeaderCell key={header}>
          <AttributeImage attribute={header} settings={settings} />
        </Table.HeaderCell>
      ))}
    </Table.Row>
  </Table.Header>
)

interface ContentProps<T extends string, E> {
  item: E
  index: number
  getContent: (value: E, search: string) => (string | number | JSX.Element)[] | null
  isPositive?: (value: E) => boolean
  isNegative?: (value: E) => boolean
  isActive: (value: E) => boolean
  searchQuery: string
  onSelect: (type: T) => void
  getValue: (value: E) => T
  onClose: () => void
}

const Content = <T extends string, E>({
  item,
  index,
  getContent,
  isPositive,
  isNegative,
  isActive,
  onSelect,
  searchQuery,
  getValue,
  onClose
}: ContentProps<T, E>) => {
  const onClick = useCallback(() => {
    onSelect(getValue(item))
    onClose()
  }, [onSelect, onClose, getValue, item])

  const content = useMemo(() => getContent(item, searchQuery), [getContent, item, searchQuery])
  if (!content) return null

  return (
    <Table.Row
      key={index}
      onClick={onClick}
      active={isActive(item)}
      positive={isPositive && isPositive(item)}
      negative={isNegative && isNegative(item)}
    >
      {content.map((cell, index) => (
        <Table.Cell key={index}>{cell}</Table.Cell>
      ))}
    </Table.Row>
  )
}

export default DropdownTable
