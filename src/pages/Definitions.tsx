import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'
import { connect } from 'react-redux'

import { AppState, mergeUnitTypes, filterTerrainTypes, getUnitImages, getMode, getCountries, getSiteSettings, getUnits } from 'state'
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
  modal_country: CountryName | undefined
  open_create_unit: boolean
}

class Definitions extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = this.initialState
  }

  initialState = { modal_country: undefined, modal_unit: undefined, open_create_unit: false }

  render() {
    const { mode, country, terrains, units, images, unit_types, weariness, openModal, settings } = this.props
    return (
      <>
        <AccordionToggle identifier='definition_units' open title='Units'>
          <CountryManager>
            <Button primary onClick={() => this.setState({ open_create_unit: true })}>
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
            unit_types={unit_types}
            onRowClick={unit => openModal(ModalType.UnitDetail, { country, type: unit.type, remove: true })}
          />
          <WearinessRange
            values={weariness}
            onChange={(type, min, max) => this.props.changeWeariness(country, type, min, max)}
          />
          <br /><br />
        </AccordionToggle>
        <br />
        <AccordionToggle identifier='definition_terrains' title='Terrains'>
          <TerrainDefinitions />
          <br /><br />
        </AccordionToggle>
        <br />
        {
          settings[Setting.Tactics] &&
          <AccordionToggle identifier='definition_tactics' title='Tactics'>
            <TacticDefinitions />
            <br /><br />
          </AccordionToggle>
        }
      </>
    )
  }

  onClick = () => this.props.openModal(ModalType.Value, {
    onSuccess: type => this.props.createUnit(this.props.country, this.props.mode, type as UnitType),
    message: 'New unit type',
    button_message: 'Create',
    initial: ''
  })
}

const mapStateToProps = (state: AppState) => ({
  units: getAllUnitList(getUnits(state), getMode(state)),
  images: getUnitImages(state),
  unit_types: mergeUnitTypes(state),
  terrains: filterTerrainTypes(state),
  mode: getMode(state),
  country: state.settings.country,
  settings: getSiteSettings(state),
  weariness: getCountries(state)[state.settings.country].weariness
})

const actions = {
  openModal, deleteUnit, createUnit, changeUnitType, changeWeariness
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Definitions)
