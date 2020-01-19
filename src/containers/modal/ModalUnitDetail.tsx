import React, { Component } from 'react'
import { connect } from 'react-redux'
import { UnitType, ValueType, setValue, changeImage, changeMode, Unit, changeDeployment, toggleIsLoyal, UnitDeployment } from '../../store/units'
import { AppState } from '../../store/'
import { CountryName } from '../../store/countries'
import { ValuesType, DefinitionType } from '../../base_definition'
import UnitDetail from '../../components/UnitDetail'
import { invalidateCountry } from '../../store/battle'
import { mergeUnitTypes, filterTerrainTypes, getUnitDefinition, getMode } from '../../store/utils'

const CUSTOM_VALUE_KEY = 'Custom'

type Props = {
  country: CountryName | undefined
  unit_type: UnitType | undefined
  changeType: (country: CountryName, old_type: UnitType, new_type: UnitType) => void
}

class ModalUnitDetail extends Component<IProps> {
  render() {
    const { mode, unit } = this.props
    if (!unit)
      return null
    return (
      <UnitDetail
        mode={mode}
        terrain_types={this.props.terrain_types}
        custom_value_key={CUSTOM_VALUE_KEY}
        unit={unit as Unit}
        unit_types={this.props.unit_types}
        onCustomBaseValueChange={this.setBaseValue}
        onCustomModifierValueChange={this.setModifierValue}
        onCustomLossValueChange={this.setLossValue}
        show_statistics={false}
        onTypeChange={this.changeType}
        onImageChange={this.changeImage}
        onModeChange={this.changeMode}
        onChangeDeployment={this.changeDeployment}
        onIsLoyalToggle={this.toggleIsLoyal}
      />
    )
  }

  changeType = (type: UnitType) => {
    const { changeType, invalidateCountry, country, unit_type } = this.props
    changeType(country!, unit_type!, type)
    invalidateCountry(country!)
  }

  setBaseValue = (key: string, attribute: ValueType, value: number) => this.setValue(ValuesType.Base, key, attribute, value)
  setModifierValue = (key: string, attribute: ValueType, value: number) => this.setValue(ValuesType.Modifier, key, attribute, value)
  setLossValue = (key: string, attribute: ValueType, value: number) => this.setValue(ValuesType.Loss, key, attribute, value)

  setValue = (type: ValuesType, key: string, attribute: ValueType, value: number) => {
    const { setValue, invalidateCountry, country, unit_type } = this.props
    setValue(country!, type, unit_type!, key, attribute, value)
    invalidateCountry(country!)
  }

  changeImage = (image: string) => {
    const { changeImage, invalidateCountry, country, unit_type } = this.props
    changeImage(country!, unit_type!, image)
    invalidateCountry(country!)
  }

  changeMode = (mode: DefinitionType) => {
    const { changeMode, invalidateCountry, country, unit_type } = this.props
    changeMode(country!, unit_type!, mode)
    invalidateCountry(country!)
  }

  changeDeployment = (deployment: UnitDeployment) => {
    const { changeDeployment, invalidateCountry, country, unit_type } = this.props
    changeDeployment(country!, unit_type!, deployment)
    invalidateCountry(country!)
  }

  toggleIsLoyal = () => {
    const { toggleIsLoyal, invalidateCountry, country, unit_type } = this.props
    toggleIsLoyal(country!, unit_type!)
    invalidateCountry(country!)
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  unit: props.country && props.unit_type && getUnitDefinition(state, props.unit_type, props.country),
  unit_types: mergeUnitTypes(state),
  terrain_types: filterTerrainTypes(state),
  mode: getMode(state)
})

const actions = { setValue, changeImage, changeMode, changeDeployment, toggleIsLoyal, invalidateCountry }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(ModalUnitDetail)
