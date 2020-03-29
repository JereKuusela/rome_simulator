import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'

import ItemSelector from 'components/ItemSelector'
import { ArmyType, UnitType, Setting, Side } from 'types'
import { getNextId } from 'army_utils'
import { AppState, getSettings, getMode, getCombatParticipant, getCountryName } from 'state'
import { selectCohort, invalidate } from 'reducers'
import { getArchetypes, getActualUnits } from 'managers/army'


interface Props {
  info: ModalSelectorInfo | null
  onClose: () => void
}

export interface ModalSelectorInfo {
  side: Side
  row: number
  column: number
  type: ArmyType
}

class ModalUnitSelector extends Component<IProps> {
  render() {
    const { units, onClose, settings, mode } = this.props
    if (!units)
      return null
    let unit_list = settings[Setting.Tech] ? getArchetypes(units, mode) : getActualUnits(units, mode)
    return (
      <Modal basic onClose={onClose} open centered={false}>
        <Modal.Content>
          <ItemSelector
            onSelection={this.selectUnit}
            items={unit_list}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (type: UnitType) => {
    const { info, selectUnit, invalidate, onClose, country } = this.props
    if (info && country)
      selectUnit(country, info.type, info.row, info.column, { id: getNextId(), type })
    invalidate()
   onClose()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  units: props.info && getCombatParticipant(state, props.info.side).unit_types,
  country: props.info && getCountryName(state, props.info.side),
  settings: getSettings(state),
  mode: getMode(state)
})

const actions = { selectUnit: selectCohort, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }
export default connect(mapStateToProps, actions)(ModalUnitSelector)
