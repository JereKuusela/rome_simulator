import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { CountryName, UnitPreferenceType, UnitType } from 'types'
import ItemRemover from 'components/ItemRemover'
import ItemSelector from 'components/ItemSelector'
import { AppState, getUnitDefinitions, getMode } from 'state'
import { setUnitPreference, invalidate } from 'reducers'
import { toArr } from 'utils'

type Props = {
  country: CountryName
  type?: UnitPreferenceType
  onClose: () => void
}

/**
 * Component for selecting unit type preference.
 */
class ModalUnitPreferenceSelector extends Component<IProps> {
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
    const { setUnitPreference, invalidate, onClose, mode, country, type } = this.props
    if (type)
      setUnitPreference(country, mode, type, unit_type)
    invalidate(mode)
    onClose()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  units: toArr(getUnitDefinitions(state, props.country)),
  mode: getMode(state)
})

const actions = { setUnitPreference, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(ModalUnitPreferenceSelector)
