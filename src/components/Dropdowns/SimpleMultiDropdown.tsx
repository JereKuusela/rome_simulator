import React, { useCallback, useMemo } from 'react'
import { Dropdown, DropdownProps } from 'semantic-ui-react'

interface IProps<T extends string | number> {
  value: T[]
  values: ({ value: T; text: string } | T)[]
  onChange?: (value: T[]) => void
  onAdd?: (value: T[]) => void
  style?: unknown
  search?: boolean
  placeholder?: string
}

const SimpleMultiDropdown = <T extends string | number>(props: IProps<T>): JSX.Element => {
  const { value, onChange, onAdd, search, placeholder, values, style } = props
  const handleAddItem = useCallback((_, { value }: DropdownProps) => onAdd && onAdd(value as T[]), [onAdd])
  const handleChange = useCallback(
    (_, { value }: DropdownProps) => {
      console.log(value)
      onChange && onChange(value as T[])
    },
    [onChange]
  )

  const options = useMemo(
    () =>
      values.map(item => {
        if (typeof item === 'object') return item
        else return { value: item, text: item }
      }),
    [values]
  )

  return (
    <Dropdown
      value={value}
      disabled={!onChange}
      onAddItem={handleAddItem}
      onChange={handleChange}
      style={style}
      search={search || !!onAdd}
      selection
      multiple
      fluid
      options={options}
      placeholder={placeholder}
      allowAdditions={!!onAdd}
    />
  )
}

export default SimpleMultiDropdown
