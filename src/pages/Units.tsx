import React, { Component } from 'react'
import { Container, Modal } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalUnitDetail from '../containers/ModalUnitDetail'
import ModalGlobalStatsDetail from '../containers/ModalGlobalStatsDetail'
import { AppState } from '../store/index'
import { DefinitionType } from '../base_definition'
import { UnitType, addUnit, deleteUnit, changeType } from '../store/units'
import UnitDefinitions from '../components/UnitDefinitions'
import ItemRemover from '../components/ItemRemover'
import { CountryName } from '../store/countries'
import CountryManager from '../containers/CountryManager'

interface IState {
  modal_country: CountryName | null
  modal_unit: UnitType | null
  open_create_unit: boolean
}

class Units extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = this.initialState
  }

  initialState = { modal_country: null, modal_unit: null, open_create_unit: false }

  render(): JSX.Element | null {
    let units = this.props.units.get(this.props.country)
    const global = this.props.global_stats.getIn([this.props.country, this.props.mode])
    const types = this.props.types.get(this.props.country)
    return (
      <Container>
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
        <CountryManager />
        <br />
        <br />
        <br />
        {
          units && global && types &&
          <UnitDefinitions
            mode={this.props.mode}
            country={this.props.country}
            types={types}
            terrains={this.props.terrains}
            global_stats={global}
            units={units.filter(unit => unit.mode === this.props.mode || unit.mode === DefinitionType.Global)}
            onRowClick={unit => this.openModal(this.props.country, unit.type)}
          />
        }

      </Container>
    )
  }

  closeModal = (): void => this.setState(this.initialState)

  openModal = (country: CountryName, unit: UnitType): void => this.setState({ modal_country: country, modal_unit: unit })

  newOnClick = (): void => this.setState({ open_create_unit: true })

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
  mode: state.settings.mode,
  country: state.settings.country
})

const mapDispatchToProps = (dispatch: any) => ({
  deleteUnit: (country: CountryName, type: UnitType) => dispatch(deleteUnit(country, type)),
  addUnit: (country: CountryName, mode: DefinitionType, type: UnitType) => dispatch(addUnit(country, mode, type)),
  changeType: (country: CountryName, old_type: UnitType, new_type: UnitType) => dispatch(changeType(country, old_type, new_type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Units)
