import React, { ChangeEvent, Component } from 'react'
import { Input as InputUI } from 'semantic-ui-react'

interface IProps<T extends string> {
  value: T
  onChange?: (value: T) => void
  disabled?: boolean
  style?: unknown
}

export default class Input<T extends string> extends Component<IProps<T>> {
  render() {
    const { value, onChange, style } = this.props
    return (
      <InputUI
        size='mini'
        style={style}
        defaultValue={value}
        disabled={!onChange}
        onChange={(_, { value }) => onChange && onChange(value as T)}
      />
    )
  }
}

export const FileInput = ({ onChange, style }: { onChange: (file: File) => void; style?: unknown }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) onChange(event.target.files[0])
  }
  return <InputUI type='file' onChange={handleChange} style={style} />
}
