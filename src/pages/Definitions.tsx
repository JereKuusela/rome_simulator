import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import { connect } from 'react-redux'

import {
  AppState,
  mergeUnitTypes,
  getTerrainTypes,
  getUnitImages,
  getMode,
  getCountries,
  getSiteSettings,
  getUnitDefinitions,
  getSelectedArmy
} from 'state'
import { createUnit, deleteUnit, changeUnitType, changeWeariness, openModal } from 'reducers'
import UnitDefinitions from 'components/UnitDefinitions'
import CountryManager from 'containers/CountryManager'
import { CountryName, UnitType, ModalType, Setting } from 'types'
import WearinessRange from 'components/WearinessRange'
import { getAllUnitList } from 'managers/army'
import AccordionToggle from 'containers/AccordionToggle'
import TerrainDefinitions from 'containers/TerrainDefinitions'
import TacticDefinitions from 'containers/TacticDefinitions'

interface IState {
  modalCountry: CountryName | undefined
  openCreateUnit: boolean
}

class Definitions extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = this.initialState
  }

  initialState = { modalCountry: undefined, openCreateUnit: false }

  render() {
    const { mode, country, army, terrains, units, images, unitTypes, weariness, openModal, settings } = this.props
    return (
      <>
        <AccordionToggle identifier='definitionUnits' open title='Units'>
          <CountryManager>
            <Button primary onClick={() => this.setState({ openCreateUnit: true })}>
              New unit
            </Button>
          </CountryManager>
          <br />
          <UnitDefinitions
            mode={mode}
            country={country}
            settings={settings}
            terrains={terrains}
            units={units}
            images={images}
            unitTypes={unitTypes}
            onRowClick={unit => openModal(ModalType.UnitDetail, { country, army, type: unit.type, remove: true })}
          />
          <WearinessRange
            values={weariness}
            onChange={(type, min, max) => this.props.changeWeariness(country, type, min, max)}
          />
          <br />
          <br />
        </AccordionToggle>
        <br />
        <AccordionToggle identifier='definitionTerrains' title='Terrains'>
          <TerrainDefinitions />
          <br />
          <br />
        </AccordionToggle>
        <br />
        {settings[Setting.Tactics] && (
          <AccordionToggle identifier='definitionTactics' title='Tactics'>
            <TacticDefinitions />
            <br />
            <br />
          </AccordionToggle>
        )}
      </>
    )
  }

  onClick = () =>
    this.props.openModal(ModalType.Value, {
      onSuccess: type => this.props.createUnit(this.props.country, this.props.mode, type as UnitType),
      message: 'New unit type',
      buttonMessage: 'Create',
      initial: ''
    })
}

const mapStateToProps = (state: AppState) => ({
  units: getAllUnitList(getUnitDefinitions(state), getMode(state)),
  images: getUnitImages(state),
  unitTypes: mergeUnitTypes(state),
  terrains: getTerrainTypes(state),
  mode: getMode(state),
  country: state.settings.country,
  army: getSelectedArmy(state),
  settings: getSiteSettings(state),
  weariness: getCountries(state)[state.settings.country].weariness
})

const actions = {
  openModal,
  deleteUnit,
  createUnit,
  changeUnitType,
  changeWeariness
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Definitions)
