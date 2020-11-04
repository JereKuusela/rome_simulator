import React, { Component } from 'react'
import { connect } from 'react-redux'

import { UnitAttribute, UnitDefinition, ValuesType, CountryName, getAttributeValuesType } from 'types'
import { setUnitValue } from 'reducers'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { filterValues, calculateBase, calculateModifier } from 'definition_values'

type Props = {
  unit: UnitDefinition
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
    const valuesType = type ?? getAttributeValuesType(attribute)
    let value = 0
    if (valuesType === ValuesType.Base) value = calculateBase(unit, attribute)
    else value = calculateModifier(unit, attribute)
    return <DelayedNumericInput value={value} onChange={this.onChange} percent={percent} />
  }

  getKey = () => this.props.identifier || 'Custom'

  onChange = (value: number) => {
    const { unit, attribute, setUnitValue, country, type } = this.props
    const valuesType = type ?? getAttributeValuesType(attribute)
    let base = 0
    if (valuesType === ValuesType.Base)
      base = calculateBase(unit, attribute) - calculateBase(filterValues(unit, this.getKey()), attribute)
    else base = calculateModifier(unit, attribute) - calculateModifier(filterValues(unit, this.getKey()), attribute)
    setUnitValue(country, unit.type, valuesType, this.getKey(), attribute, value - base)
  }
}

const mapStateToProps = () => ({})

const actions = { setUnitValue }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D {}

export default connect(mapStateToProps, actions)(UnitValueInput)
