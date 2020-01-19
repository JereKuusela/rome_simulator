import React, { Component } from 'react'
import { connect } from 'react-redux'

import UnitDetail from '../../components/UnitDetail'

import { AppState } from '../../store/'
import { UnitType, setGlobalValue, ValueType, Unit, toggleGlobalIsLoyal } from '../../store/units'
import { CountryName } from '../../store/countries'
import { invalidateCountry } from '../../store/battle'

import { ValuesType } from '../../base_definition'
import { getBaseDefinition } from '../../store/utils'

const CUSTOM_VALUE_KEY = 'Global'

interface Props {
  readonly country: CountryName | undefined
  readonly unit: UnitType | undefined
}

class ModalGlobalStatsDetail extends Component<IProps> {
  render() {
    const { country, unit, global_stats, mode } = this.props
    if (!country || unit)
      return null
    return (
      <UnitDetail
        mode={mode}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={global_stats as Unit}
        onCustomBaseValueChange={this.setGlobalBaseValue}
        onCustomModifierValueChange={this.setGlobalModifierValue}
        onCustomLossValueChange={this.setGlobalLossValue}
        onIsLoyalToggle={this.toggleIsLoyal}
        show_statistics={false}
      />
    )
  }

  setGlobalBaseValue = (key: string, attribute: ValueType, value: number) => this.setValue(key, ValuesType.Base, attribute, value)

  setGlobalModifierValue = (key: string, attribute: ValueType, value: number) => this.setValue(key, ValuesType.Modifier, attribute, value)

  setGlobalLossValue = (key: string, attribute: ValueType, value: number) => this.setValue(key, ValuesType.Loss, attribute, value)

  setValue = (key: string, type: ValuesType, attribute: ValueType, value: number) => {
    if (Number.isNaN(value))
      return
    const { country, mode, setGlobalValue, invalidateCountry } = this.props
    setGlobalValue(country!, mode, type, key, attribute, value)
    invalidateCountry(country!)
  }

  toggleIsLoyal = () => {
    const { country, mode, toggleGlobalIsLoyal, invalidateCountry } = this.props
    toggleGlobalIsLoyal(country!, mode)
    invalidateCountry(country!)
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  global_stats: getBaseDefinition(state, props.country),
  mode: state.settings.mode
})

const actions = { setGlobalValue, invalidateCountry, toggleGlobalIsLoyal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }
export default connect(mapStateToProps, actions)(ModalGlobalStatsDetail)
