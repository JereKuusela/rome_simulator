import React, { Component } from 'react'
import { connect } from 'react-redux'

import { UnitAttribute, Unit, ValuesType, CountryName, getAttributeValuesType } from 'types'
import { invalidate, setUnitValue } from 'reducers'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { filterValues, calculateBase, calculateModifier } from 'definition_values'

type Props = {
  unit: Unit
  country: CountryName
  identifier?: string
  attribute: UnitAttribute
  percent?: boolean
  type?: ValuesType
}

/** 
 * Custom numeric input for setting attribute values for a unit.
 */
class UnitValueInput extends Component<IProps> {
  render() {
    const { unit, attribute, percent, type } = this.props
    const values_type = type ?? getAttributeValuesType(attribute)
    let value = 0
    if (values_type === ValuesType.Base)
      value = calculateBase(unit, attribute)
    else
      value = calculateModifier(unit, attribute) - 1
    return (
      <DelayedNumericInput value={value} onChange={this.onChange} percent={percent} />
    )
  }

  getKey = () => this.props.identifier || 'Custom'

  onChange = (value: number) => {
    const { unit, attribute, setUnitValue, invalidate, country, type } = this.props
    const values_type = type ?? getAttributeValuesType(attribute)
    let base = 0
    if (values_type === ValuesType.Base)
      base = calculateBase(unit, attribute) - calculateBase(filterValues(unit, this.getKey()), attribute)
    else
      base = calculateModifier(unit, attribute) - calculateModifier(filterValues(unit, this.getKey()), attribute)
    setUnitValue(country, unit.type, values_type, this.getKey(), attribute, value - base)
    invalidate()
  }
}

const mapStateToProps = () => ({})

const actions = { invalidate, setUnitValue }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(UnitValueInput)
