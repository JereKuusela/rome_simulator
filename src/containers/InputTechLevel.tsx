import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setTechLevel, invalidate } from 'reducers'
import { CountryName } from 'types'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'

type Props = {
  country: CountryName
  tech: number
}

/** Input for quickly setting tech level and related modifiers. */
class InputTechLevel extends Component<IProps> {

  render() {
    const { tech } = this.props
    return (
      <DelayedNumericInput
        type='number'
        value={tech}
        onChange={value => this.setTechLevel(value)}
      />
    )
  }

  setTechLevel = (level: number) => {
    const { country, setTechLevel, invalidate } = this.props
    level = Math.max(0, level)
    setTechLevel(country, level)
    invalidate()
  }

  getNumberFromKey = (key: string, index: number) => {
    const split = key.split('_')
    if (split.length > index)
      return Number(split[index])
    return -1
  }
}

const mapStateToProps = () => ({})

const actions = { setTechLevel, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }
export default connect(mapStateToProps, actions)(InputTechLevel)
