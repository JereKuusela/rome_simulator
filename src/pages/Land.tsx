import React, { Component } from 'react'
import { Container, Header, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { ArmyType } from '../store/units/types'
import { TableLandBattle } from '../components/TableLandBattle'
import { battle } from '../store/land_battle'
import { ParticipantState } from '../store/land_battle'
import ModalUnitSelector, { ModalInfo } from '../containers/ModalUnitSelector'


interface IStateFromProps {
  readonly attacker: ParticipantState
  readonly defender: ParticipantState
}
interface IDispatchFromProps {
  battle: () => void
}
interface IProps extends IStateFromProps, IDispatchFromProps { }

interface IState {
  modal_info: ModalInfo | null
}

class Land extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_info: null };
  }


  closeModal = () => this.setState({modal_info: null})
  
  openModal = (army: ArmyType, row: number, column: number) => this.setState({modal_info: {army, row, column}})

  render() {
    return (
      <Container>
        <ModalUnitSelector
          info={this.state.modal_info}
          onClose={this.closeModal}
        />
        <Button onClick={this.props.battle}>FIGHT</Button>
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
          onClick={(row, column) => this.openModal(army, row, column)}
          units={units.army}
          reverse={army === ArmyType.Attacker}
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
  battle: () => dispatch(battle())
})


export default connect(mapStateToProps, mapDispatchToProps)(Land)
