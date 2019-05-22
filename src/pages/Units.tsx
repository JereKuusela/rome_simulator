import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import ModalUnitDetail from '../containers/ModalUnitDetail'
import ModalGlobalStatsDetail from '../containers/ModalGlobalStatsDetail'
import { AppState } from '../store/index'
import { UnitType, UnitDefinition, ArmyType } from '../store/units/types'
import { TableUnitDefinitions } from '../components/TableUnitDefinitions'

interface IState {
  modal_army: ArmyType | null
  modal_unit: UnitType | null
}

class Units extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_army: null, modal_unit: null };
  }

  closeModal = () => this.setState({ modal_army: null, modal_unit: null })

  openModal = (army: ArmyType, unit: UnitType) => this.setState({ modal_army: army, modal_unit: unit })

  render() {
    return (
      <Container>
        <ModalUnitDetail
          onClose={this.closeModal}
          army={this.state.modal_army}
          unit={this.state.modal_unit}
        />
        <ModalGlobalStatsDetail
          onClose={this.closeModal}
          army={this.state.modal_army}
          unit={this.state.modal_unit}
        />
        {
          Array.from(this.props.units).map(value => {
            return this.renderArmy(value[0], value[1], this.props.global_stats.get(value[0]))
          })
        }
      </Container>
    )
  }
  renderArmy = (army: ArmyType, units: Map<UnitType, UnitDefinition>, global_stats: UnitDefinition | undefined) => {
    return (
      <div key={army}>
        <TableUnitDefinitions
          army={army}
          global_stats={global_stats}
          units={units.toList()}
          onRowClick={unit => this.openModal(army, unit.type)}
        />
        <br/>
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  units: state.units.units,
  global_stats: state.units.global_stats
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Units)
