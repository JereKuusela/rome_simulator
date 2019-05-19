import React, { Component } from 'react'
import { ActionCreators } from 'redux-undo'
import { Container, Header, Button, Grid } from 'semantic-ui-react'
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
  readonly is_undo: boolean
  readonly is_redo: boolean
  readonly round: number
}
interface IDispatchFromProps {
  battle: () => void
  undo: () => void
  redo: () => void
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


  closeModal = () => this.setState({ modal_info: null })

  openModal = (army: ArmyType, row: number, column: number) => this.setState({ modal_info: { army, row, column } })

  render() {
    return (
      <Container>
        <ModalUnitSelector
          info={this.state.modal_info}
          onClose={this.closeModal}
        />
        <Grid verticalAlign='middle'>
          <Grid.Row columns={3}>
            <Grid.Column>
              <Button disabled={!this.props.is_undo} onClick={this.props.undo}>
                {'<'}
              </Button>
              <Button onClick={this.props.battle}>
                FIGHT
              </Button>
              <Button disabled={!this.props.is_redo} onClick={this.props.redo}>
                {'>'}
              </Button>
            </Grid.Column>
            <Grid.Column></Grid.Column>
            <Grid.Column><Header>{'Round: ' + this.props.round}</Header></Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderArmy(ArmyType.Attacker, this.props.attacker)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              {
                this.renderArmy(ArmyType.Defender, this.props.defender)
              }
            </Grid.Column>
          </Grid.Row>
        </Grid >
      </Container >
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
  attacker: state.land.present.attacker,
  defender: state.land.present.defender,
  is_undo: state.land.past.length > 0,
  is_redo: state.land.future.length > 0,
  round: state.land.present.day
})

const mapDispatchToProps = (dispatch: any): IDispatchFromProps => ({
  battle: () => dispatch(battle()),
  undo: () => dispatch(ActionCreators.undo()),
  redo: () => dispatch(ActionCreators.redo())
})


export default connect(mapStateToProps, mapDispatchToProps)(Land)
