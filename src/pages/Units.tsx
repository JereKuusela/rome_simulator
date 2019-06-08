import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container, Modal } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalUnitDetail from '../containers/ModalUnitDetail'
import ModalGlobalStatsDetail from '../containers/ModalGlobalStatsDetail'
import { AppState } from '../store/index'
import { UnitType, UnitDefinition, ArmyName, addUnit, deleteUnit, changeType } from '../store/units'
import UnitDefinitions from '../components/UnitDefinitions'
import ItemRemover from '../components/ItemRemover'

interface IState {
  modal_army: ArmyName | null
  modal_unit: UnitType | null
}

class Units extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_army: null, modal_unit: null };
  }

  closeModal = () => this.setState({ modal_army: null, modal_unit: null })

  openModal = (army: ArmyName, unit: UnitType) => this.setState({ modal_army: army, modal_unit: unit })

  render() {
    return (
      <Container>
        <Modal basic onClose={this.closeModal} open={this.state.modal_army !== null}>
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
              army={this.state.modal_army}
              unit={this.state.modal_unit}
              changeType={this.onChangeType}
            />
            <ModalGlobalStatsDetail
              army={this.state.modal_army}
              unit={this.state.modal_unit}
            />
          </Modal.Content>
        </Modal>
        {
          Array.from(this.props.units).map(value => {
            return this.renderArmy(value[0], value[1], this.props.global_stats.get(value[0])!)
          })
        }
      </Container>
    )
  }
  renderArmy = (army: ArmyName, units: Map<UnitType, UnitDefinition>, global_stats: UnitDefinition) => {
    return (
      <div key={army}>
        <UnitDefinitions
          army={army}
          types={this.props.types.get(army)!}
          terrains={this.props.terrains}
          global_stats={global_stats}
          units={units}
          onRowClick={unit => this.openModal(army, unit.type)}
          onCreateNew={type => this.props.addUnit(army, type)}
        />
        <br />
        <br />
      </div>
    )
  }

  onRemove = () => this.state.modal_army && this.state.modal_unit && this.props.deleteUnit(this.state.modal_army, this.state.modal_unit)

  onChangeType = (army: ArmyName, old_type: UnitType, new_type: UnitType) => {
    this.props.changeType(army, old_type, new_type)
    this.setState({ modal_unit: new_type })
  }
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.definitions,
  terrains: state.terrains.types,
  types: state.units.types,
  global_stats: state.global_stats
})

const mapDispatchToProps = (dispatch: any) => ({
  deleteUnit: (army: ArmyName, type: UnitType) => dispatch(deleteUnit(army, type)),
  addUnit: (army: ArmyName, type: UnitType) => dispatch(addUnit(army, type)),
  changeType: (army: ArmyName, old_type: UnitType, new_type: UnitType) => dispatch(changeType(army, old_type, new_type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Units)
