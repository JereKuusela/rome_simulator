import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'

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
const UnitValueInput = ({ unit, country, attribute, percent, type, identifier }: Props): JSX.Element => {
  const dispatch = useDispatch()

  const key = identifier || 'Custom'

  const onChange = useCallback(
    (value: number) => {
      const valuesType = type ?? getAttributeValuesType(attribute)
      let base = 0
      if (valuesType === ValuesType.Base)
        base = calculateBase(unit, attribute) - calculateBase(filterValues(unit, key), attribute)
      else base = calculateModifier(unit, attribute) - calculateModifier(filterValues(unit, key), attribute)
      dispatch(setUnitValue(country, unit.type, valuesType, key, attribute, value - base))
    },
    [dispatch, key, attribute, country, type, unit]
  )

  const valuesType = type ?? getAttributeValuesType(attribute)
  let value = 0
  if (valuesType === ValuesType.Base) value = calculateBase(unit, attribute)
  else value = calculateModifier(unit, attribute)
  return <DelayedNumericInput value={value} onChange={onChange} percent={percent} />
}

export default UnitValueInput
