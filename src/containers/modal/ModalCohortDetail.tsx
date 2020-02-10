import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'

import ItemRemover from 'components/ItemRemover'
import UnitDetail from 'components/UnitDetail'

import { AppState, filterUnitTypesByCountry, filterTerrainTypes, findUnit, getCombatUnitForEachRound, getMode, getSettings } from 'state'
import { ValuesType, Side, CountryName, UnitType, Cohort, UnitCalc, UnitValueType } from 'types'
import { CombatUnit } from 'combat'
import { addValues } from 'definition_values'
import { editCohort, deleteCohort, invalidate, setCohortValue, changeCohortType, toggleCohortLoyality } from 'reducers'

const CUSTOM_VALUE_KEY = 'Unit'

interface Props {
  side: Side
  country: CountryName
  id: number
  onClose: () => void
}

class ModalCohortDetail extends Component<IProps> {

  render() {
    const { onClose, mode, unit_types, terrain_types, unit, settings } = this.props
    if (!unit)
      return null
    return (
      <Modal basic onClose={onClose} open>
        <Modal.Content>
          <ItemRemover onRemove={this.removeUnit} />
          <UnitDetail
            mode={mode}
            settings={settings}
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
    const { id, country, deleteCohort, invalidate, onClose } = this.props
    deleteCohort(country, id)
    invalidate()
    onClose()
  }

  setBaseValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, id, setCohortValue, invalidate } = this.props
    setCohortValue(country, id, ValuesType.Base, key, attribute, value)
    invalidate()
  }

  setModifierValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, id, setCohortValue, invalidate } = this.props
    setCohortValue(country, id, ValuesType.Modifier, key, attribute, value)
    invalidate()
  }

  setLossValue = (key: string, attribute: UnitValueType, value: number) => {
    const { country, id, setCohortValue, invalidate } = this.props
    setCohortValue(country, id, ValuesType.Loss, key, attribute, value)
    invalidate()
  }

  changeType = (type: UnitType) => {
    const { country, id, changeCohortType, invalidate } = this.props
    changeCohortType(country, id, type)
    invalidate()
  }

  toggleIsLoyal = () => {
    const { country, id, toggleCohortLoyality, invalidate } = this.props
    toggleCohortLoyality(country, id)
    invalidate()
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
    definition = addValues(definition!, ValuesType.Loss, 'Round ' + (round - 1), lossValues)
    definition = addValues(definition!, ValuesType.Base, 'Round ' + (round - 1), dealtValues)

  })
  return definition
}

const mapStateToProps = (state: AppState, props: Props) => ({
  unit_types: props.country ? filterUnitTypesByCountry(state, props.country) : [],
  terrain_types: filterTerrainTypes(state),
  mode: getMode(state),
  unit: convertUnit(findUnit(state, props.side, props.id), getCombatUnitForEachRound(state, props.side, props.id)),
  settings: getSettings(state)
})

const actions = { editCohort, deleteCohort, invalidate, setCohortValue, changeCohortType, toggleCohortLoyality }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }

export default connect(mapStateToProps, actions)(ModalCohortDetail)
