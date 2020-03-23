

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Input } from 'semantic-ui-react'

import { AppState, getCountries } from 'state'
import { selectCountry, setTechLevel, enableGeneralModifiers, clearGeneralModifiers, clearUnitModifiers, enableUnitModifiers, enableSelection, clearSelection, invalidate, enableCountryModifiers, clearCountryModifiers } from 'reducers'
import { CountryName, Modifier } from 'types'
import { mapRange, has } from 'utils'
import { mapModifiersToUnits } from 'managers/modifiers'

interface Props {
  country: CountryName
  tech: number
}

const TECH_KEY = 'Tech_'

/** Input for quickly setting tech level and related modifiers. */
class InputTechLevel extends Component<IProps> {

  render() {
    const { tech } = this.props
    return (
      <Input size='mini' className='small-input' type='number' value={tech} onChange={(_, { value }) => this.setTechLevel(Number(value))} />
    )
  }

  setTechLevel = (level: number) => {
    const { country, selections, tech_levels, setTechLevel } = this.props
    level = Math.max(0, level)
    setTechLevel(country, level)
    Object.keys(selections).filter(value => value.startsWith(TECH_KEY) && this.getNumberFromKey(value, 1) > level)
      .forEach(value => this.clearModifiers(value))
    mapRange(level + 1, number => number).filter(value => !has(selections, TECH_KEY + value) && tech_levels[value])
      .forEach(value => this.enableModifiers(TECH_KEY + value, tech_levels[value].modifiers))
  }

  getNumberFromKey = (key: string, index: number) => {
    const split = key.split('_')
    if (split.length > index)
      return Number(split[index])
    return -1
  }

  enableModifiers = (key: string, modifiers: Modifier[]) => {
    const { enableGeneralModifiers, enableUnitModifiers, enableSelection, invalidate, country, enableCountryModifiers, selectCountry } = this.props
    selectCountry(country)
    modifiers = mapModifiersToUnits(modifiers)
    enableGeneralModifiers(country, key, modifiers)
    enableUnitModifiers(country, key, modifiers)
    enableSelection(country, key)
    enableCountryModifiers(country, key, modifiers)
    invalidate()
  }

  clearModifiers = (key: string) => {
    const { clearGeneralModifiers, clearUnitModifiers, clearSelection, invalidate, country, clearCountryModifiers, selectCountry } = this.props
    selectCountry(country)
    clearGeneralModifiers(country, key)
    clearUnitModifiers(country, key)
    clearSelection(country, key)
    clearCountryModifiers(country, key)
    invalidate()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  selections: getCountries(state)[props.country].selections,
  tech_levels: state.data.tech_euiv,
})

const actions = {
  setTechLevel, enableGeneralModifiers, clearGeneralModifiers, clearUnitModifiers, enableUnitModifiers, enableSelection, clearSelection, invalidate, enableCountryModifiers, clearCountryModifiers, selectCountry
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }
export default connect(mapStateToProps, actions)(InputTechLevel)
