import React, { Component } from 'react'
import { connect } from 'react-redux'

import { CountryName, CountryAttribute } from 'types'
import { setCountryValue } from 'reducers'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { filterValues, calculateBase } from 'definition_values'
import { getCountries, AppState } from 'state'

type Props = {
  country: CountryName
  identifier?: string
  attribute: CountryAttribute
  percent?: boolean
}

/** 
 * Custom numeric input for setting attribute values for a country.
 */
class CountryValueInput extends Component<IProps> {
  render() {
    const { attribute, percent, definition } = this.props
    const value = calculateBase(definition, attribute)
    return (
      <DelayedNumericInput value={value} onChange={this.onChange} percent={percent} />
    )
  }

  getKey = () => this.props.identifier || 'Custom'

  onChange = (value: number) => {
    const { definition, attribute, setCountryValue, country } = this.props
    const base = calculateBase(definition, attribute) - calculateBase(filterValues(definition, this.getKey()), attribute)
    setCountryValue(country, this.getKey(), attribute, value - base)
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  definition: getCountries(state)[props.country]
})

const actions = { setCountryValue }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(CountryValueInput)
