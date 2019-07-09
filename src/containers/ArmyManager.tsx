import React, { Component } from 'react'
import { connect } from 'react-redux'
import DropdownSelector from '../components/DropdownSelector'
import ValueDropdownModal from '../components/ValueDropdownModal'
import ValueModal from '../components/ValueModal'
import { AppState } from '../store/'
import { getBattle } from '../utils'
import { ArmyName } from '../store/battle'
import { createArmy, changeArmyName, deleteArmy } from '../store/armies'
import { Grid, Button } from 'semantic-ui-react'
import { selectArmy } from '../store/settings'
import Confirmation from '../components/Confirmation'


interface IState {
  open_create_army: boolean
  open_edit_army: boolean
  open_delete_army: boolean
}
class ArmyManager extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = this.initialState
  }

  initialState = { open_create_army: false, open_edit_army: false, open_delete_army: false }

  render(): JSX.Element | null {
    return (
      <Grid>
        <ValueDropdownModal
          value={'' as ArmyName}
          selected={'' as ArmyName}
          open={this.state.open_create_army}
          onSuccess={this.props.createArmy}
          onClose={this.onClose}
          items={this.props.armies.keySeq()}
          message='New army'
          button_message='Create'
          value_label='Name '
          dropdown_label='Copy army: '
        />
        <ValueModal
          open={this.state.open_edit_army}
          onSuccess={name => this.props.changeArmyName(this.props.selected_army, name)}
          onClose={this.onClose}
          message='Rename army'
          button_message='Edit'
          initial={this.props.selected_army}
        />
        <Confirmation
          open={this.state.open_delete_army}
          onClose={this.onClose}
          onConfirm={() => this.props.deleteArmy(this.props.selected_army)}
          message={'Are you sure you want to remove army ' + this.props.selected_army + ' ?'}
        />
        <Grid.Row columns='5'>
          <Grid.Column>
            <DropdownSelector
              items={this.props.armies.keySeq()}
              active={this.props.selected_army}
              onSelect={this.props.selectArmy}
            />
          </Grid.Column>
          <Grid.Column>
            <Button primary onClick={() => this.setState({ open_create_army: true })}>
              New army
            </Button>
          </Grid.Column>
          {
            this.props.selected_army &&
            <Grid.Column>
              <Button primary onClick={() => this.setState({ open_edit_army: true })}>
                Rename army
            </Button>
            </Grid.Column>
          }
          {
            this.props.selected_army &&
            <Grid.Column>
              <Button primary onClick={() => this.setState({ open_delete_army: true })}>
                Delete army
            </Button>
            </Grid.Column>
          }
          {
            React.Children.map(this.props.children, elem => (
              <Grid.Column>
                {elem}
              </Grid.Column>
            ))
          }
        </Grid.Row>

      </Grid>
    )
  }
  onClose = (): void => this.setState(this.initialState)
}

const mapStateToProps = (state: AppState) => ({
  selected_army: state.settings.army,
  armies: getBattle(state).armies
})

const mapDispatchToProps = (dispatch: any) => ({
  selectArmy: (army: ArmyName) => (dispatch(selectArmy(army))),
  createArmy: (army: ArmyName, source_army?: ArmyName) => dispatch(createArmy(army, source_army)),
  changeArmyName: (old_army: ArmyName, army: ArmyName) => dispatch(changeArmyName(old_army, army)),
  deleteArmy: (army: ArmyName) => dispatch(deleteArmy(army))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

export default connect(mapStateToProps, mapDispatchToProps)(ArmyManager)
