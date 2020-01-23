import React, { Component } from 'react'
import { Modal, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'

import ModalUnitDetail from 'containers/modal/ModalUnitDetail'
import ModalGlobalStatsDetail from 'containers/modal/ModalGlobalStatsDetail'
import { AppState, mergeUnitTypes, filterTerrainTypes, getUnitDefinitions, getBaseDefinition, getUnitImages } from 'state'
import { addUnit, deleteUnit, changeUnitType } from 'reducers'
import UnitDefinitions from 'components/UnitDefinitions'
import ItemRemover from 'components/ItemRemover'
import ValueModal from 'components/ValueModal'
import CountryManager from 'containers/CountryManager'
import { CountryName, UnitType, DefinitionType } from 'types'

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
    return (
      <>
        <ValueModal
          open={this.state.open_create_unit}
          onSuccess={type => this.props.addUnit(this.props.country, this.props.mode, type)}
          onClose={this.closeModal}
          message='Create unit'
          button_message='Create'
          initial={'' as UnitType}
        />
        <Modal basic onClose={this.closeModal} open={!!this.state.modal_country}>
          <Modal.Content>
            {
              this.state.modal_unit ?
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
            <ModalGlobalStatsDetail
              country={this.state.modal_country}
              unit={this.state.modal_unit}
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
          mode={this.props.mode}
          country={this.props.country}
          terrains={this.props.terrains}
          base_definition={this.props.base_definition}
          definitions={this.props.definitions}
          images={this.props.images}
          unit_types={this.props.unit_types}
          onRowClick={unit => this.openModal(this.props.country, unit.type)}
        />
      </>
    )
  }

  closeModal = (): void => this.setState(this.initialState)

  openModal = (country: CountryName, unit: UnitType): void => this.setState({ modal_country: country, modal_unit: unit })

  onRemove = (): void => {
    this.state.modal_country && this.state.modal_unit && this.props.deleteUnit(this.state.modal_country, this.state.modal_unit)
    this.closeModal()
  }

  onChangeType = (country: CountryName, old_type: UnitType, new_type: UnitType): void => {
    this.props.changeType(country, old_type, new_type)
    this.setState({ modal_unit: new_type })
  }

}

const mapStateToProps = (state: AppState) => ({
  base_definition: getBaseDefinition(state),
  definitions: getUnitDefinitions(state),
  images: getUnitImages(state),
  unit_types: mergeUnitTypes(state),
  terrains: filterTerrainTypes(state),
  mode: state.settings.mode,
  country: state.settings.country
})

const mapDispatchToProps = (dispatch: any) => ({
  deleteUnit: (country: CountryName, type: UnitType) => dispatch(deleteUnit(country, type)),
  addUnit: (country: CountryName, mode: DefinitionType, type: UnitType) => dispatch(addUnit(country, mode, type)),
  changeType: (country: CountryName, old_type: UnitType, new_type: UnitType) => dispatch(changeUnitType(country, old_type, new_type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Units)
