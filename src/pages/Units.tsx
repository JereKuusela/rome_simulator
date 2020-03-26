import React, { Component } from 'react'
import { Modal, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'

import ModalUnitDetail from 'containers/modal/ModalUnitDetail'
import { AppState, mergeUnitTypes, filterTerrainTypes, getUnitImages, getMode, getUnitList, getCountries } from 'state'
import { createUnit, deleteUnit, changeUnitType, changeWeariness } from 'reducers'
import UnitDefinitions from 'components/UnitDefinitions'
import ItemRemover from 'components/ItemRemover'
import ValueModal from 'components/ValueModal'
import CountryManager from 'containers/CountryManager'
import { CountryName, UnitType } from 'types'
import { getBaseUnitType } from 'managers/units'
import WearinessRange from 'components/WearinessRange'

interface IState {
  modal_country: CountryName | undefined
  modal_unit: UnitType | undefined
  open_create_unit: boolean
}

class Units extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = this.initialState
  }

  initialState = { modal_country: undefined, modal_unit: undefined, open_create_unit: false }

  render() {
    const { mode, createUnit, country, terrains, units, images, unit_types, weariness } = this.props
    return (
      <>
        <ValueModal
          open={this.state.open_create_unit}
          onSuccess={type => createUnit(country, mode, type)}
          onClose={this.closeModal}
          message='Create unit'
          button_message='Create'
          initial={'' as UnitType}
        />
        <Modal basic onClose={this.closeModal} open={!!this.state.modal_country}>
          <Modal.Content>
            {
              this.state.modal_unit && this.state.modal_unit !== getBaseUnitType(mode) ?
                <ItemRemover
                  onRemove={this.onRemove}
                  confirm_remove={true}
                  item={'item definition ' + String(this.state.modal_unit)}
                />
                : null
            }
            <ModalUnitDetail
              country={this.state.modal_country}
              unit_type={this.state.modal_unit}
              changeType={this.onChangeType}
            />
          </Modal.Content>
        </Modal>
        <CountryManager>
          <Button primary onClick={() => this.setState({ open_create_unit: true })}>
            New unit
            </Button>
        </CountryManager>
        <br />
        <UnitDefinitions
          mode={mode}
          country={country}
          terrains={terrains}
          units={units}
          images={images}
          unit_types={unit_types}
          onRowClick={unit => this.openModal(country, unit.type)}
        />
        <WearinessRange
          values={weariness}
          onChange={(type, min, max) => this.props.changeWeariness(country, type, min, max)}
        />
      </>
    )
  }

  closeModal = (): void => this.setState(this.initialState)

  openModal = (country: CountryName, unit: UnitType): void => this.setState({ modal_country: country, modal_unit: unit })

  onRemove = (): void => {
    this.state.modal_country && this.state.modal_unit && this.props.deleteUnit(this.props.country, this.state.modal_unit)
    this.closeModal()
  }

  onChangeType = (old_type: UnitType, new_type: UnitType): void => {
    this.props.changeUnitType(this.props.country, old_type, new_type)
    this.setState({ modal_unit: new_type })
  }

}

const mapStateToProps = (state: AppState) => ({
  units: getUnitList(state, false),
  images: getUnitImages(state),
  unit_types: mergeUnitTypes(state),
  terrains: filterTerrainTypes(state),
  mode: getMode(state),
  country: state.settings.country,
  weariness: getCountries(state)[state.settings.country].weariness
})

const actions = {
  deleteUnit, createUnit, changeUnitType, changeWeariness
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Units)
