import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import { connect } from 'react-redux'

import { AppState, mergeUnitTypes, filterTerrainTypes, getUnitImages, getMode, getUnitList, getCountries } from 'state'
import { createUnit, deleteUnit, changeUnitType, changeWeariness, openModal } from 'reducers'
import UnitDefinitions from 'components/UnitDefinitions'
import ValueModal from 'components/ValueModal'
import CountryManager from 'containers/CountryManager'
import { CountryName, UnitType, ModalType } from 'types'
import WearinessRange from 'components/WearinessRange'

interface IState {
  modal_country: CountryName | undefined
  open_create_unit: boolean
}

class Units extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = this.initialState
  }

  initialState = { modal_country: undefined, modal_unit: undefined, open_create_unit: false }

  render() {
    const { mode, createUnit, country, terrains, units, images, unit_types, weariness, openModal } = this.props
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
          onRowClick={unit => openModal(ModalType.UnitDetail, { country, type: unit.type, remove: true})}
        />
        <WearinessRange
          values={weariness}
          onChange={(type, min, max) => this.props.changeWeariness(country, type, min, max)}
        />
      </>
    )
  }

  closeModal = (): void => this.setState(this.initialState)
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
  openModal, deleteUnit, createUnit, changeUnitType, changeWeariness
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Units)
