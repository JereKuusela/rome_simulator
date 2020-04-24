import React, { Component } from 'react'
import { connect } from 'react-redux'

import ItemSelector from 'components/ItemSelector'
import { ArmyType, UnitType, Setting, ModalType, CountryName, CombatUnitTypes, ArmyName } from 'types'
import { getNextId } from 'army_utils'
import { AppState, getMode, getCombatParticipant, getSiteSettings, getParticipant } from 'state'
import { selectCohort, closeModal } from 'reducers'
import { getArchetypes, getActualUnits } from 'managers/army'
import BaseModal from './BaseModal'

class ModalCohortSelector extends Component<IProps> {
  render() {
    const { units, settings, mode } = this.props
    let unit_list = settings[Setting.Tech] ? getArchetypes(units, mode) : getActualUnits(units, mode)
    return (
      <BaseModal basic type={ModalType.CohortSelector}>
        <ItemSelector
          onSelection={this.selectUnit}
          items={unit_list}
        />
      </BaseModal>
    )
  }

  selectUnit = (unit: UnitType) => {
    const { selectCohort, army, closeModal, country, type, row, column } = this.props
    if (country)
      selectCohort(country, army, type, row, column, { id: getNextId(), type: unit })
    closeModal()
  }
}

const mapStateToProps = (state: AppState) => {
  const data = state.ui.modals[ModalType.CohortSelector]
  if (data) {
    const participant = getParticipant(state, data.side)
    return {
      row: data.row,
      column: data.column,
      type: data.type,
      country: participant.country,
      army: participant.army,
      units: getCombatParticipant(state, data.side).unit_types,
      mode: getMode(state),
      settings: getSiteSettings(state)
    }
  }
  return {
    row: 0,
    column: 0,
    type: ArmyType.Frontline,
    country: CountryName.Country1,
    army: ArmyName.Army1,
    mode: getMode(state),
    settings: getSiteSettings(state),
    units: {} as CombatUnitTypes,
  }
}

const actions = { selectCohort, closeModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }
export default connect(mapStateToProps, actions)(ModalCohortSelector)
