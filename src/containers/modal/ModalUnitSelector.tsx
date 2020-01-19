import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'

import ItemSelector from '../../components/ItemSelector'

import { AppState } from '../../store/'
import { UnitType } from '../../store/units'
import { selectUnit, ArmyType, invalidate } from '../../store/battle'
import { CountryName } from '../../store/countries'

import { getNextId } from '../../army_utils'
import { toArr } from '../../utils'
import { getUnitDefinitions } from '../../store/utils'

interface Props {
  info: ModalInfo | null
  onClose: () => void
}

export interface ModalInfo {
  country: CountryName
  index: number
  type: ArmyType
}

class ModalUnitSelector extends Component<IProps> {
  render() {
    const { units, onClose } = this.props
    if (!units)
      return null
    return (
      <Modal basic onClose={onClose} open centered={false}>
        <Modal.Content>
          <ItemSelector
            onSelection={this.selectUnit}
            items={toArr(units)}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectUnit = (type: UnitType) => {
    if (this.props.info)
      this.props.selectUnit(this.props.mode, this.props.info.country, this.props.info.type, this.props.info.index, { id: getNextId(), type })
    this.props.invalidate(this.props.mode)
    this.props.onClose()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  units: props.info && getUnitDefinitions(state, props.info.country),
  mode: state.settings.mode
})

const actions = { selectUnit, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends Props, S, D { }
export default connect(mapStateToProps, actions)(ModalUnitSelector)
