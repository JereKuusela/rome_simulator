import React, { Component } from 'react'
import { connect } from 'react-redux'

import { CountryName, CountryAttribute } from 'types'
import { setCountryAttribute } from 'reducers'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { filterValues, calculateBase } from 'definition_values'
import { getCountries, AppState } from 'state'

type Props = {
  country: CountryName
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
  onChange = (value: number) => {
    const { definition, attribute, setCountryAttribute, country } = this.props
    const base = calculateBase(definition, attribute) - calculateBase(filterValues(definition, 'Custom'), attribute)
    setCountryAttribute(country, attribute, value - base)
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  definition: getCountries(state)[props.country]
})

const actions = { setCountryAttribute }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(CountryValueInput)
