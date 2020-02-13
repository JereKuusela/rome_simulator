import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ValuesType, CountryName, UnitType, Cohort, UnitRole, UnitValueType } from 'types'
import UnitDetail from 'components/UnitDetail'
import { AppState, getUnit, mergeUnitTypes, filterTerrainTypes, getMode, getSettings } from 'state'
import { setUnitValue, changeUnitImage, changeUnitBaseType, changeUnitDeployment, toggleUnitLoyality, invalidate } from 'reducers'


const CUSTOM_VALUE_KEY = 'Custom'

type Props = {
  country: CountryName | undefined
  unit_type: UnitType | undefined
  changeType: (old_type: UnitType, new_type: UnitType) => void
}

class ModalUnitDetail extends Component<IProps> {
  render() {
    const { mode, unit, settings } = this.props
    if (!unit)
      return null
    return (
      <UnitDetail
        mode={mode}
        settings={settings}
        terrain_types={this.props.terrain_types}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={unit as Cohort}
        unit_types={this.props.unit_types}
        onCustomBaseValueChange={this.setBaseValue}
        onCustomModifierValueChange={this.setModifierValue}
        onCustomLossValueChange={this.setLossValue}
        show_statistics={false}
        onTypeChange={this.changeType}
        onImageChange={this.changeImage}
        onBaseTypeChange={this.changeBaseType}
        onChangeDeployment={this.changeDeployment}
        onIsLoyalToggle={this.toggleIsLoyal}
      />
    )
  }

  changeType = (type: UnitType) => {
    const { changeType, invalidate, unit_type } = this.props
    changeType(unit_type!, type)
    invalidate()
  }

  setBaseValue = (key: string, attribute: UnitValueType, value: number) => this.setValue(ValuesType.Base, key, attribute, value)
  setModifierValue = (key: string, attribute: UnitValueType, value: number) => this.setValue(ValuesType.Modifier, key, attribute, value)
  setLossValue = (key: string, attribute: UnitValueType, value: number) => this.setValue(ValuesType.Loss, key, attribute, value)

  setValue = (type: ValuesType, key: string, attribute: UnitValueType, value: number) => {
    const { setUnitValue, invalidate, unit_type } = this.props
    setUnitValue(unit_type!, type, key, attribute, value)
    invalidate()
  }

  changeImage = (image: string) => {
    const { changeUnitImage, invalidate, unit_type } = this.props
    changeUnitImage(unit_type!, image)
    invalidate()
  }

  changeBaseType = (type: UnitType) => {
    const { changeUnitBaseType, invalidate, unit_type } = this.props
    changeUnitBaseType(unit_type!, type)
    invalidate()
  }

  changeDeployment = (deployment: UnitRole) => {
    const { changeUnitDeployment, invalidate, unit_type } = this.props
    changeUnitDeployment(unit_type!, deployment)
    invalidate()
  }

  toggleIsLoyal = () => {
    const { toggleUnitLoyality, invalidate, unit_type } = this.props
    toggleUnitLoyality(unit_type!)
    invalidate()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  unit: props.country && props.unit_type && getUnit(state, props.unit_type, props.country),
  unit_types: mergeUnitTypes(state),
  terrain_types: filterTerrainTypes(state),
  mode: getMode(state),
  settings: getSettings(state)
})

const actions = { setUnitValue, changeUnitImage, changeUnitBaseType, changeUnitDeployment, toggleUnitLoyality, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(ModalUnitDetail)
