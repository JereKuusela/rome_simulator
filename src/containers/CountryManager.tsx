import React, { Component } from 'react'
import { connect } from 'react-redux'
import DropdownSelector from '../components/DropdownSelector'
import ValueDropdownModal from '../components/ValueDropdownModal'
import ValueModal from '../components/ValueModal'
import { AppState } from '../store/'
import { CountryName, createCountry, changeCountryName, deleteCountry } from '../store/countries'
import { Grid, Button } from 'semantic-ui-react'
import { selectCountry } from '../store/settings'
import Confirmation from '../components/Confirmation'
import { keys } from '../utils'


interface IState {
  open_create_country: boolean
  open_edit_country: boolean
  open_delete_country: boolean
}
class CountryManager extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = this.initialState
  }

  initialState = { open_create_country: false, open_delete_country: false, open_edit_country: false }

  render(): JSX.Element | null {
    return (
      <Grid>
        <ValueDropdownModal
          value={'' as CountryName}
          selected={'' as CountryName}
          open={this.state.open_create_country}
          onSuccess={this.props.createCountry}
          onClose={this.onClose}
          items={keys(this.props.countries)}
          message='New country'
          button_message='Create'
          value_label='Name '
          dropdown_label='Copy country: '
        />
        <ValueModal
          open={this.state.open_edit_country}
          onSuccess={name => this.props.changeCountryName(this.props.selected_country, name)}
          onClose={this.onClose}
          message='Rename country'
          button_message='Edit'
          initial={this.props.selected_country}
        />
        <Confirmation
          open={this.state.open_delete_country}
          onClose={this.onClose}
          onConfirm={() => this.props.deleteCountry(this.props.selected_country)}
          message={'Are you sure you want to remove country ' + this.props.selected_country + ' ?'}
        />
        <Grid.Row columns='5'>
          <Grid.Column>
            <DropdownSelector
              items={keys(this.props.countries)}
              value={this.props.selected_country}
              onSelect={this.props.selectCountry}
            />
          </Grid.Column>
          <Grid.Column>
            <Button primary onClick={() => this.setState({ open_create_country: true })}>
              New country
            </Button>
          </Grid.Column>
          {
            this.props.selected_country &&
            <Grid.Column>
              <Button primary onClick={() => this.setState({ open_edit_country: true })}>
                Rename country
              </Button>
            </Grid.Column>
          }
          {
            this.props.selected_country &&
            <Grid.Column>
              <Button primary onClick={() => this.setState({ open_delete_country: true })}>
                Delete country
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
  selected_country: state.settings.country,
  countries: state.countries
})

const mapDispatchToProps = (dispatch: any) => ({
  selectCountry: (country: CountryName) => (dispatch(selectCountry(country))),
  createCountry: (country: CountryName, source_country?: CountryName) => dispatch(createCountry(country, source_country)),
  changeCountryName: (old_country: CountryName, country: CountryName) => dispatch(changeCountryName(old_country, country)),
  deleteCountry: (country: CountryName) => dispatch(deleteCountry(country))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

export default connect(mapStateToProps, mapDispatchToProps)(CountryManager)
