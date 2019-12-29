import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'

import ItemRemover from '../../components/ItemRemover'
import UnitDetail from '../../components/UnitDetail'

import { AppState } from '../../store/'
import { UnitType, ValueType, Unit, UnitCalc } from '../../store/units'
import { editUnit, deleteUnit, setValue, changeType, invalidateCountry, Side, toggleLoyal } from '../../store/battle'
import { CountryName } from '../../store/countries'
import { filterTerrainTypes, filterUnitTypesByCountry, findUnit, getCombatUnitForEachRound } from '../../store/utils'

import { ValuesType, addValues } from '../../base_definition'
import { CombatUnit } from '../../combat/combat'

const CUSTOM_VALUE_KEY = 'Unit'

interface Props {
  side: Side
  country: CountryName
  id: number
  onClose: () => void
}

class ModalArmyUnitDetail extends Component<IProps> {

  render() {
    const { onClose, mode, unit_types, terrain_types, unit } = this.props
    if (!unit)
      return null
    return (
      <Modal basic onClose={onClose} open>
        <Modal.Content>
          <ItemRemover onRemove={this.removeUnit} />
          <UnitDetail
            mode={mode}
            terrain_types={terrain_types}
            custom_value_key={CUSTOM_VALUE_KEY}
            unit={unit}
            unit_types={unit_types}
            unit_types_as_dropdown={true}
            onTypeChange={this.changeType}
            onCustomBaseValueChange={this.setBaseValue}
            onCustomModifierValueChange={this.setModifierValue}
            onCustomLossValueChange={this.setLossValue}
            onIsLoyalToggle={this.toggleIsLoyal}
            show_statistics={true}
          />
        </Modal.Content>
      </Modal>
    )
  }

  removeUnit = () => {
    const { mode, id, country, deleteUnit, invalidateCountry, onClose } = this.props
    deleteUnit(mode, country, id)
    invalidateCountry(country)
    onClose()
  }

  setBaseValue = (key: string, attribute: ValueType, value: number) => {
    const { mode, country, id, setValue, invalidateCountry } = this.props
    setValue(mode, country, id, ValuesType.Base, key, attribute, value)
    invalidateCountry(country)
  }

  setModifierValue = (key: string, attribute: ValueType, value: number) => {
    const { mode, country, id, setValue, invalidateCountry } = this.props
    setValue(mode, country, id, ValuesType.Modifier, key, attribute, value)
    invalidateCountry(country)
  }

  setLossValue = (key: string, attribute: ValueType, value: number) => {
    const { mode, country, id, setValue, invalidateCountry } = this.props
    setValue(mode, country, id, ValuesType.Loss, key, attribute, value)
    invalidateCountry(country)
  }

  changeType = (type: UnitType) => {
    const { mode, country, id, changeType, invalidateCountry } = this.props
    changeType(mode, country, id, type)
    invalidateCountry(country)
  }

  toggleIsLoyal = () => {
    const { mode, country, id, toggleLoyal, invalidateCountry } = this.props
    toggleLoyal(mode, country, id)
    invalidateCountry(country)
  }
}


const convertUnit = (definition: Unit | null, rounds: (CombatUnit | null)[]): Unit | null => {
  if (!definition)
    return null
  rounds.forEach((combat, round) => {
    if (!combat)
      return
    const lossValues: [string, number][] = [
      [UnitCalc.Morale, combat.state.morale_loss],
      [UnitCalc.Strength, combat.state.strength_loss]
    ]
    const dealtValues: [string, number][] = [
      [UnitCalc.MoraleDepleted, combat.state.morale_dealt],
      [UnitCalc.StrengthDepleted, combat.state.strength_dealt]
    ]
    definition = addValues(definition!, ValuesType.Loss, 'Round ' + (round - 1),  lossValues)
    definition = addValues(definition!, ValuesType.Base, 'Round ' + (round - 1),  dealtValues)

  })
  return definition
}

const mapStateToProps = (state: AppState, props: Props) => ({
  unit_types: props.country ? filterUnitTypesByCountry(state, props.country) : [],
  global_stats: state.global_stats,
  terrain_types: filterTerrainTypes(state),
  mode: state.settings.mode,
  unit: convertUnit(findUnit(state, props.side, props.id), getCombatUnitForEachRound(state, props.side, props.id) )
})

const actions = { editUnit, deleteUnit, invalidateCountry, setValue, changeType, toggleLoyal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }

export default connect(mapStateToProps, actions)(ModalArmyUnitDetail)
