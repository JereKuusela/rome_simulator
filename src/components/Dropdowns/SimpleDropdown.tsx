import React, { useCallback, useMemo } from 'react'
import { Dropdown, DropdownProps } from 'semantic-ui-react'

interface IProps<T extends string | number> {
  value: T
  values: ({ value: T; text: string } | T)[]
  onChange?: (value: T) => void
  clearable?: boolean
  onAdd?: (value: T) => void
  style?: unknown
  search?: boolean
  placeholder?: string
}

const SimpleDropdown = <T extends string | number>(props: IProps<T>): JSX.Element => {
  const { value, clearable, onChange, onAdd, search, placeholder, values } = props
  const style = props.style ?? { minWidth: 170, maxWidth: 170 }

  const handleAddItem = useCallback((_, { value }: DropdownProps) => onAdd && onAdd(value as T), [onAdd])
  const handleChange = useCallback((_, { value }: DropdownProps) => onChange && onChange(value as T), [onChange])

  const options = useMemo(
    () =>
      values.map(item => {
        if (typeof item === 'object') return { key: item.value, value: item.value, text: item.text }
        else return { key: item, value: item, text: item }
      }),
    [values]
  )

  return (
    <Dropdown
      className='selection'
      clearable={clearable}
      value={value}
      disabled={!onChange}
      onAddItem={handleAddItem}
      onChange={handleChange}
      style={style}
      compact={!!style}
      search={search || !!onAdd}
      selection
      options={options}
      placeholder={placeholder}
      allowAdditions={!!onAdd}
    />
  )
}

export default SimpleDropdown
