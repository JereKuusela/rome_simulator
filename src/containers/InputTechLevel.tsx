

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Input } from 'semantic-ui-react'

import { AppState, getCountries } from 'state'
import { setTechLevel, enableGeneralModifiers, clearGeneralModifiers, clearUnitModifiers, enableUnitModifiers, enableSelection, clearSelection, invalidate } from 'reducers'
import { CountryName, Modifier } from 'types'
import {  mapRange, has } from 'utils'
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
      <Input size='mini' style={{ width: 100 }} type='number' value={tech} onChange={(_, { value }) => this.setTechLevel(Number(value))} />
    )
  }

  setTechLevel = (level: number) => {
    const { country, selections, tech_levels, setTechLevel } = this.props
    level = Math.max(0, level)
    setTechLevel(country, level)
    Object.keys(selections).filter(value => value.startsWith(TECH_KEY) && this.getNumberFromKey(value, 1) > level)
      .forEach(value => this.clearModifiers(value))
    mapRange(level + 1, number => number).filter(value => !has(selections, TECH_KEY + value))
      .forEach(value => this.enableModifiers(TECH_KEY + value, tech_levels[value].modifiers))
  }

  getNumberFromKey = (key: string, index: number) => {
    const split = key.split('_')
    if (split.length > index)
      return Number(split[index])
    return -1
  }

  enableModifiers = (key: string, modifiers: Modifier[]) => {
    const { enableGeneralModifiers, enableUnitModifiers, enableSelection, invalidate, country } = this.props
    modifiers = mapModifiersToUnits(modifiers)
    enableGeneralModifiers(country, key, modifiers)
    enableUnitModifiers(key, modifiers)
    enableSelection(country, key)
    invalidate()
  }

  clearModifiers = (key: string) => {
    const { clearGeneralModifiers, clearUnitModifiers, clearSelection, invalidate, country } = this.props
    clearGeneralModifiers(country, key)
    clearUnitModifiers(key)
    clearSelection(country, key)
    invalidate()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  selections: getCountries(state)[props.country].selections,
  tech_levels: state.data.tech_euiv,
})

const actions = {
  setTechLevel, enableGeneralModifiers, clearGeneralModifiers, clearUnitModifiers, enableUnitModifiers, enableSelection, clearSelection, invalidate
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }
export default connect(mapStateToProps, actions)(InputTechLevel)
