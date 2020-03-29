import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'

import ItemSelector from 'components/ItemSelector'
import { CountryName, ArmyType, UnitType, Setting } from 'types'
import { getNextId } from 'army_utils'
import { AppState, getUnits, getSettings, getMode } from 'state'
import { selectCohort, invalidate } from 'reducers'
import { getArchetypes, getActualUnits } from 'managers/army'


interface Props {
  info: ModalSelectorInfo | null
  onClose: () => void
}

export interface ModalSelectorInfo {
  country: CountryName
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
    const { info, selectUnit, invalidate, onClose } = this.props
    if (info)
      selectUnit(info.country, info.type, info.row, info.column, { id: getNextId(), type })
    invalidate()
   onClose()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  units: props.info && getUnits(state, props.info.country),
  settings: getSettings(state),
  mode: getMode(state)
})

const actions = { selectUnit: selectCohort, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }
export default connect(mapStateToProps, actions)(ModalUnitSelector)
