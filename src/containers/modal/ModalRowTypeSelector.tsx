import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'

import { UnitType } from '../../store/units'
import { AppState } from '../../store/'
import { setRowType, RowType, invalidate } from '../../store/battle'
import { getUnitDefinitions } from '../../store/utils'

import { CountryName } from '../../store/countries'
import { toArr } from '../../utils'

import ItemSelector from '../../components/ItemSelector'
import ItemRemover from '../../components/ItemRemover'

type Props = {
  country: CountryName
  type?: RowType
  onClose: () => void
}

class ModalRowTypeSelector extends Component<IProps> {
  render() {
    const { units, type, onClose } = this.props
    if (!type)
      return null
    return (
      <Modal basic onClose={onClose} open centered={false}>
        <Modal.Content>
          <ItemRemover
            onRemove={() => this.selectUnit(null)}
          />
          <ItemSelector
            onSelection={this.selectUnit}
            items={units}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (unit_type: UnitType | null): void => {
    const { setRowType, invalidate, onClose, mode, country, type } = this.props
    if (type)
      setRowType(this.props.mode, country, type, unit_type)
    invalidate(mode)
    onClose()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  units: toArr(getUnitDefinitions(state, props.country)),
  mode: state.settings.mode
})

const actions = { setRowType, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(ModalRowTypeSelector)
