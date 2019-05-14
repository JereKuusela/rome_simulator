import { Map } from 'immutable'
import React, { Component } from 'react'
import { Container, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { UnitType, UnitDefinition, ArmyType } from '../store/units/types'
import { setUnitModal } from '../store/layout'
import { TableLandBattle } from '../components/TableLandBattle'


interface IStateFromProps {
  readonly units: Map<ArmyType, Map<UnitType, UnitDefinition>>
}
interface IDispatchFromProps {
  editUnit: (army: ArmyType, unit: UnitDefinition) => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

class Land extends Component<IProps> {

  render() {
    return (
      <Container>
        {
          Array.from(this.props.units).map((value) => {
            return this.renderArmy(value[0], value[1])
          })
        }
      </Container>
    )
  }
  renderArmy = (army: ArmyType, units: Map<UnitType, UnitDefinition>) => {
    return (
      <div key={army}>
        <Header>{army}</Header>
        <TableLandBattle
        />
      </div>
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  units: state.units.units
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  editUnit: (army: ArmyType, unit: UnitDefinition) => dispatch(setUnitModal(army, unit))
})


export default connect(mapStateToProps, mapDispatchToProps)(Land)