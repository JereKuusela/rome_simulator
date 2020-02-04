import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'

import ItemRemover from 'components/ItemRemover'
import UnitDetail from 'components/UnitDetail'

import { AppState, filterUnitTypesByCountry, filterTerrainTypes, findUnit, getCombatUnitForEachRound, getMode } from 'state'
import { ValuesType, Side, CountryName, UnitType, Cohort, UnitCalc, UnitValueType } from 'types'
import { CombatUnit } from 'combat'
import { addValues } from 'definition_values'
import { editCohort, deleteCohort, invalidateCountry, setCohortValue, changeCohortType, toggleCohortLoyality } from 'reducers'

const CUSTOM_VALUE_KEY = 'Unit'

interface Props {
  side: Side
  country: CountryName
  id: number
  onClose: () => void
}

class ModalCohortDetail extends Component<IProps> {

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
            disable_base_values={true}
          />
        </Modal.Content>
      </Modal>
    )
  }

  removeUnit = () => {
    const { mode, id, country, deleteCohort, invalidateCountry, onClose } = this.props
    deleteCohort(country, mode, id)
    invalidateCountry(country)
    onClose()
  }

  setBaseValue = (key: string, attribute: UnitValueType, value: number) => {
    const { mode, country, id, setCohortValue, invalidateCountry } = this.props
    setCohortValue(country, mode, id, ValuesType.Base, key, attribute, value)
    invalidateCountry(country)
  }

  setModifierValue = (key: string, attribute: UnitValueType, value: number) => {
    const { mode, country, id, setCohortValue, invalidateCountry } = this.props
    setCohortValue(country, mode, id, ValuesType.Modifier, key, attribute, value)
    invalidateCountry(country)
  }

  setLossValue = (key: string, attribute: UnitValueType, value: number) => {
    const { mode, country, id, setCohortValue, invalidateCountry } = this.props
    setCohortValue(country, mode, id, ValuesType.Loss, key, attribute, value)
    invalidateCountry(country)
  }

  changeType = (type: UnitType) => {
    const { mode, country, id, changeCohortType, invalidateCountry } = this.props
    changeCohortType(country, mode, id, type)
    invalidateCountry(country)
  }

  toggleIsLoyal = () => {
    const { mode, country, id, toggleCohortLoyality, invalidateCountry } = this.props
    toggleCohortLoyality(country, mode, id)
    invalidateCountry(country)
  }
}


const convertUnit = (definition: Cohort | null, rounds: (CombatUnit | null)[]): Cohort | null => {
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
  terrain_types: filterTerrainTypes(state),
  mode: getMode(state),
  unit: convertUnit(findUnit(state, props.side, props.id), getCombatUnitForEachRound(state, props.side, props.id) )
})

const actions = { editCohort, deleteCohort, invalidateCountry, setCohortValue, changeCohortType, toggleCohortLoyality }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }

export default connect(mapStateToProps, actions)(ModalCohortDetail)
