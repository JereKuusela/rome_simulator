import React from 'react'
import { useDispatch } from 'react-redux'

import { CountryName, CountryAttribute, countryAttributeToEffect } from 'types'
import { setCountryAttribute } from 'reducers'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { filterValues, calculateBase } from 'data_values'
import ListModifier from 'components/Utils/ListModifier'
import { getDynamicEffect } from 'managers/modifiers'
import { useCountryDefinition } from 'selectors'

type Props = {
  country: CountryName
  attribute: CountryAttribute
  percent?: boolean
  showEffect?: boolean
}

const CountryValueEffect = ({ attribute, value }: { attribute: CountryAttribute; value: number }) => {
  const modifiers = getDynamicEffect(countryAttributeToEffect(attribute), value)
  return <ListModifier horizontal name='' modifiers={modifiers} showZero />
}

/**
 * Custom numeric input for setting attribute values for a country.
 */
const CountryValueInput = ({ attribute, percent, country, showEffect }: Props) => {
  const dispatch = useDispatch()
  const handleChange = (value: number) => {
    const base =
      calculateBase(definition.modifiers, attribute) -
      calculateBase(filterValues(definition.modifiers, 'Custom'), attribute)
    dispatch(setCountryAttribute(country, attribute, value - base))
  }

  const definition = useCountryDefinition(country)

  const value = calculateBase(definition.modifiers, attribute)
  return (
    <>
      <DelayedNumericInput value={value} onChange={handleChange} percent={percent} />
      {showEffect && (
        <span style={{ marginLeft: '1em' }}>
          <CountryValueEffect value={value} attribute={attribute} />
        </span>
      )}
    </>
  )
}

export default CountryValueInput
