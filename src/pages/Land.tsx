import React, { Component } from 'react'
import { Container, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { UnitDefinition, ArmyType } from '../store/units/types'
import { setUnitModal } from '../store/layout'
import { TableLandBattle } from '../components/TableLandBattle'
import { ParticipantState } from '../store/land_battle'


interface IStateFromProps {
  readonly attacker: ParticipantState
  readonly defender: ParticipantState
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
          this.renderArmy(ArmyType.Attacker, this.props.attacker)
        }
        {
          this.renderArmy(ArmyType.Defender, this.props.defender)
        }
      </Container>
    )
  }
  renderArmy = (army: ArmyType, units: ParticipantState) => {
    return (
      <div key={army}>
        <Header>{army}</Header>
        <TableLandBattle
         units = {units.army}
         reverse = {army === ArmyType.Attacker}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: AppState): IStateFromProps => ({
  attacker: state.land.attacker,
  defender: state.land.defender
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  editUnit: (army: ArmyType, unit: UnitDefinition) => dispatch(setUnitModal(army, unit))
})


export default connect(mapStateToProps, mapDispatchToProps)(Land)
