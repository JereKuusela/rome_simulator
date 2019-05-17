import React, { Component } from 'react'
import { Container, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyType } from '../store/units/types'
import { TableLandBattle } from '../components/TableLandBattle'
import { ParticipantState } from '../store/land_battle'


interface IStateFromProps {
  readonly attacker: ParticipantState
  readonly defender: ParticipantState
}
interface IDispatchFromProps {
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
})


export default connect(mapStateToProps, mapDispatchToProps)(Land)
