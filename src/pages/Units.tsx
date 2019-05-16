import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { UnitType, UnitDefinition, ArmyType } from '../store/units/types'
import { setUnitModal } from '../store/layout'
import { TableUnitDefinitions } from '../components/TableUnitDefinitions'


interface IStateFromProps {
  readonly units: Map<ArmyType, Map<UnitType, UnitDefinition>>
  readonly global_stats: Map<ArmyType, UnitDefinition>
}
interface IDispatchFromProps {
  editUnit: (army: ArmyType, unit: UnitDefinition) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

class Units extends Component<IProps> {

  render() {
    return (
      <Container>
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
        <Header>{army}</Header>
        <TableUnitDefinitions
          army={army}
          global_stats={global_stats}
          units={units.toList()}
          onRowClick={unit => this.props.editUnit(army, unit)}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  units: state.units.units,
  global_stats: state.units.global_stats
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  editUnit: (army, unit) => dispatch(setUnitModal(army, unit))
})


export default connect(mapStateToProps, mapDispatchToProps)(Units)
