import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container, Modal, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalUnitDetail from '../containers/ModalUnitDetail'
import ModalGlobalStatsDetail from '../containers/ModalGlobalStatsDetail'
import { AppState } from '../store/index'
import { DefinitionType } from '../base_definition'
import { UnitType, UnitDefinition, ArmyName, addUnit, deleteUnit, changeType, createArmy, changeName, deleteArmy, duplicateArmy } from '../store/units'
import UnitDefinitions from '../components/UnitDefinitions'
import ItemRemover from '../components/ItemRemover'
import ValueModal from '../components/ValueModal'

interface IState {
  modal_army: ArmyName | null
  modal_unit: UnitType | null
  open_create: boolean
}

class Units extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_army: null, modal_unit: null, open_create : false};
  }

  closeModal = (): void => this.setState({ modal_army: null, modal_unit: null, open_create : false  })

  openModal = (army: ArmyName, unit: UnitType): void => this.setState({ modal_army: army, modal_unit: unit })

  newOnClick = (): void => this.setState({ open_create: true })

  onCreate = (name: string): void => this.props.createArmy(name as ArmyName)

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
  renderArmy = (army: ArmyName, units: Map<UnitType, UnitDefinition>, global_stats: UnitDefinition): JSX.Element => {
    return (
      <div key={army}>
        <UnitDefinitions
          mode={this.props.mode}
          army={army}
          types={this.props.types.get(army)!}
          terrains={this.props.terrains}
          global_stats={global_stats}
          units={units.filter(unit => unit.mode === this.props.mode || unit.mode === DefinitionType.Any)}
          onRowClick={unit => this.openModal(army, unit.type)}
          onCreateNew={type => this.props.addUnit(army, this.props.mode, type)}
          onChangeName={(old_name, new_name) => this.props.changeName(old_name, new_name)}
          onDelete={this.props.deleteArmy}
          onDuplicate={this.props.duplicateArmy}
        />
        <br />
        <br />
      </div>
    )
  }

  onRemove = (): void => this.state.modal_army && this.state.modal_unit && this.props.deleteUnit(this.state.modal_army, this.state.modal_unit)

  onChangeType = (army: ArmyName, old_type: UnitType, new_type: UnitType): void => {
    this.props.changeType(army, old_type, new_type)
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
  deleteUnit: (army: ArmyName, type: UnitType) => dispatch(deleteUnit(army, type)),
  addUnit: (army: ArmyName, mode: DefinitionType, type: UnitType) => dispatch(addUnit(army, mode, type)),
  changeType: (army: ArmyName, old_type: UnitType, new_type: UnitType) => dispatch(changeType(army, old_type, new_type)),
  createArmy: (army: ArmyName) => dispatch(createArmy(army)),
  changeName: (old_name: ArmyName, new_name: ArmyName) => dispatch(changeName(old_name, new_name)),
  duplicateArmy: (source: ArmyName, army: ArmyName) => dispatch(duplicateArmy(source, army)),
  deleteArmy: (army: ArmyName) => dispatch(deleteArmy(army))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Units)
