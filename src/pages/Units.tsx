import React, { Component } from 'react'
import { Container, Modal, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalUnitDetail from '../containers/ModalUnitDetail'
import ModalGlobalStatsDetail from '../containers/ModalGlobalStatsDetail'
import { AppState } from '../store/index'
import { DefinitionType } from '../base_definition'
import { UnitType, addUnit, deleteUnit, changeType } from '../store/units'
import UnitDefinitions from '../components/UnitDefinitions'
import ItemRemover from '../components/ItemRemover'
import ValueModal from '../components/ValueModal'
import ValueDropdownModal from '../components/ValueDropdownModal'
import { CountryName, createCountry, changeCountryName, deleteCountry } from '../store/countries'
import CountrySelector from '../containers/CountrySelector'
import Confirmation from '../components/Confirmation'

interface IState {
  modal_country: CountryName | null
  modal_unit: UnitType | null
  open_create_country: boolean
  open_create_unit: boolean
  open_edit: boolean
  open_confirm: boolean
}

class Units extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_country: null, modal_unit: null, open_create_country: false, open_confirm: false, open_edit: false, open_create_unit: false };
  }

  render(): JSX.Element | null {
    let units = this.props.units.get(this.props.country)
    const global = this.props.global_stats.getIn([this.props.country, this.props.mode])
    const types = this.props.types.get(this.props.country)
    if (!units || !global || !types)
      return null
    units = units.filter(unit => unit.mode === this.props.mode || unit.mode === DefinitionType.Global)
    return (
      <Container>
        <ValueModal
          open={this.state.open_edit}
          onSuccess={this.onEdit}
          onClose={this.closeModal}
          message='Edit name'
          button_message='Edit'
          initial={this.props.country}
        />
        <Confirmation
          onClose={this.closeModal}
          onConfirm={this.onConfirm}
          open={this.state.open_confirm}
          message={'Are you sure you want to remove army ' + this.props.country + ' ?'}
        />
        <Modal basic onClose={this.closeModal} open={this.state.modal_country !== null}>
          <Modal.Content>
            {
              this.state.modal_unit ?
                <ItemRemover
                  onClose={this.closeModal}
                  onRemove={this.onRemove}
                  confirm_remove={true}
                  item={'item definition ' + String(this.state.modal_unit)}
                />
                : null
            }
            <ModalUnitDetail
              country={this.state.modal_country}
              unit={this.state.modal_unit}
              changeType={this.onChangeType}
            />
            <ModalGlobalStatsDetail
              country={this.state.modal_country}
              unit={this.state.modal_unit}
            />
          </Modal.Content>
        </Modal>
        <CountrySelector />
        <Button primary onClick={this.newOnClick}>
          Create new army
        </Button>
        <Button primary onClick={this.newOnClick}>
          Create new unit
        </Button>
        <Button primary onClick={this.editOnClick}>
          Change army name
        </Button>
        <Button primary onClick={this.confirmOnClick}>
          Delete army
        </Button>
        <br />
        <br />
        <br />
        <UnitDefinitions
          mode={this.props.mode}
          country={this.props.country}
          types={types}
          terrains={this.props.terrains}
          global_stats={global}
          units={units}
          onRowClick={unit => this.openModal(this.props.country, unit.type)}
        />
      </Container>
    )
  }

  closeModal = (): void => this.setState({ modal_country: null, modal_unit: null, open_create_country: false, open_confirm: false, open_edit: false, open_create_unit: false  })

  openModal = (country: CountryName, unit: UnitType): void => this.setState({ modal_country: country, modal_unit: unit })

  newOnClick = (): void => this.setState({ open_create_country: true })

  onRemove = (): void => this.state.modal_country && this.state.modal_unit && this.props.deleteUnit(this.state.modal_country, this.state.modal_unit)

  onChangeType = (country: CountryName, old_type: UnitType, new_type: UnitType): void => {
    this.props.changeType(country, old_type, new_type)
    this.setState({ modal_unit: new_type })
  }

  onConfirm = (): void => this.props.deleteCountry(this.props.country)

  confirmOnClick = (): void => this.setState({ open_confirm: true })

  onEdit = (name: string): void => this.props.changeCountryName(this.props.country, name as CountryName)

  editOnClick = (): void => this.setState({ open_edit: true })

}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions,
  terrains: state.terrains.types,
  types: state.units.types,
  global_stats: state.global_stats,
  mode: state.settings.mode,
  country: state.settings.country
})

const mapDispatchToProps = (dispatch: any) => ({
  deleteUnit: (country: CountryName, type: UnitType) => dispatch(deleteUnit(country, type)),
  addUnit: (country: CountryName, mode: DefinitionType, type: UnitType) => dispatch(addUnit(country, mode, type)),
  changeType: (country: CountryName, old_type: UnitType, new_type: UnitType) => dispatch(changeType(country, old_type, new_type)),
  changeCountryName: (old_country: CountryName, country: CountryName) => dispatch(changeCountryName(old_country, country)),
  deleteCountry: (country: CountryName) => dispatch(deleteCountry(country))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Units)
