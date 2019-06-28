import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container, Modal, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalUnitDetail from '../containers/ModalUnitDetail'
import ModalGlobalStatsDetail from '../containers/ModalGlobalStatsDetail'
import { AppState } from '../store/index'
import { DefinitionType } from '../base_definition'
import { UnitType, UnitDefinition, addUnit, deleteUnit, changeType } from '../store/units'
import UnitDefinitions from '../components/UnitDefinitions'
import ItemRemover from '../components/ItemRemover'
import ValueModal from '../components/ValueModal'
import { CountryName, createCountry, changeCountryName, deleteCountry, duplicateCountry } from '../store/countries'

interface IState {
  modal_country: CountryName | null
  modal_unit: UnitType | null
  open_create: boolean
}

class Units extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_country: null, modal_unit: null, open_create : false};
  }

  closeModal = (): void => this.setState({ modal_country: null, modal_unit: null, open_create : false  })

  openModal = (country: CountryName, unit: UnitType): void => this.setState({ modal_country: country, modal_unit: unit })

  newOnClick = (): void => this.setState({ open_create: true })

  onCreate = (name: string): void => this.props.createCountry(name as CountryName)

  render(): JSX.Element {
    return (
      <Container>
        <ValueModal
          open={this.state.open_create}
          onSuccess={this.onCreate}
          onClose={this.closeModal}
          message='New army'
          button_message='Create'
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
        <Button primary onClick={this.newOnClick}>
          Create new army
        </Button>
        <br/>
        <br/>
        <br/>
        {
          Array.from(this.props.units).map(value => {
            return this.renderArmy(value[0], value[1], this.props.global_stats.getIn([value[0], this.props.mode]))
          })
        }
      </Container>
    )
  }
  renderArmy = (country: CountryName, units: Map<UnitType, UnitDefinition>, global_stats: UnitDefinition): JSX.Element => {
    return (
      <div key={country}>
        <UnitDefinitions
          mode={this.props.mode}
          country={country}
          types={this.props.types.get(country)!}
          terrains={this.props.terrains}
          global_stats={global_stats}
          units={units.filter(unit => unit.mode === this.props.mode || unit.mode === DefinitionType.Global)}
          onRowClick={unit => this.openModal(country, unit.type)}
          onCreateNew={type => this.props.addUnit(country, this.props.mode, type)}
          onChangeName={(old_name, new_name) => this.props.changeCountryName(old_name, new_name)}
          onDelete={this.props.deleteCountry}
          onDuplicate={this.props.duplicateCountry}
        />
        <br />
        <br />
      </div>
    )
  }

  onRemove = (): void => this.state.modal_country && this.state.modal_unit && this.props.deleteUnit(this.state.modal_country, this.state.modal_unit)

  onChangeType = (country: CountryName, old_type: UnitType, new_type: UnitType): void => {
    this.props.changeType(country, old_type, new_type)
    this.setState({ modal_unit: new_type })
  }
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions,
  terrains: state.terrains.types,
  types: state.units.types,
  global_stats: state.global_stats,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  deleteUnit: (country: CountryName, type: UnitType) => dispatch(deleteUnit(country, type)),
  addUnit: (country: CountryName, mode: DefinitionType, type: UnitType) => dispatch(addUnit(country, mode, type)),
  changeType: (country: CountryName, old_type: UnitType, new_type: UnitType) => dispatch(changeType(country, old_type, new_type)),
  createCountry: (country: CountryName) => dispatch(createCountry(country)),
  changeCountryName: (old_country: CountryName, country: CountryName) => dispatch(changeCountryName(old_country, country)),
  duplicateCountry: (source_country: CountryName, country: CountryName) => dispatch(duplicateCountry(source_country, country)),
  deleteCountry: (country: CountryName) => dispatch(deleteCountry(country))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Units)
