import React, { Component } from 'react'
import { connect } from 'react-redux'

import { UnitAttribute, Unit, ValuesType, CountryName } from 'types'
import { invalidate, setUnitValue, selectCountry } from 'reducers'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { filterValues, calculateBase } from 'definition_values'

type Props = {
  unit: Unit
  country: CountryName
  identifier?: string
  attribute: UnitAttribute
  percent?: boolean
}

/** 
 * Custom numeric input for setting attribute values for a unit.
 */
class UnitValueInput extends Component<IProps> {
  render() {
    const { unit, attribute, percent } = this.props
    return (
      <DelayedNumericInput value={calculateBase(unit, attribute)} onChange={this.onChange} percent={percent} />
    )
  }

  getKey = () => this.props.identifier || 'Custom'

  onChange = (value: number) => {
    const { unit, attribute, setUnitValue, invalidate, country, selectCountry } = this.props
    const base = calculateBase(unit, attribute) - calculateBase(filterValues(unit, this.getKey()), attribute)
    selectCountry(country)
    setUnitValue(unit.type, ValuesType.Base, this.getKey(), attribute, value - base)
    invalidate()
  }
}

const mapStateToProps = () => ({})

const actions = { invalidate, setUnitValue, selectCountry }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(UnitValueInput)
