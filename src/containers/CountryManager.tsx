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

  render() {
    const { createCountry, countries, changeCountryName, selected_country, deleteCountry, selectCountry, children } = this.props
    const { open_create_country, open_edit_country, open_delete_country } = this.state
    return (
      <Grid>
        <ValueDropdownModal
          value={'' as CountryName}
          selected={'' as CountryName}
          open={open_create_country}
          onSuccess={createCountry}
          onClose={this.onClose}
          items={keys(countries)}
          message='New country'
          button_message='Create'
          value_label='Name '
          dropdown_label='Copy country: '
        />
        <ValueModal
          open={open_edit_country}
          onSuccess={name => changeCountryName(selected_country, name)}
          onClose={this.onClose}
          message='Rename country'
          button_message='Edit'
          initial={selected_country}
        />
        <Confirmation
          open={open_delete_country}
          onClose={this.onClose}
          onConfirm={() => deleteCountry(selected_country)}
          message={'Are you sure you want to remove country ' + selected_country + ' ?'}
        />
        <Grid.Row columns='5'>
          <Grid.Column>
            <DropdownSelector
              items={keys(countries)}
              value={selected_country}
              onSelect={selectCountry}
            />
          </Grid.Column>
          <Grid.Column>
            <Button primary onClick={() => this.setState({ open_create_country: true })}>
              New country
            </Button>
          </Grid.Column>
          {
            selected_country &&
            <Grid.Column>
              <Button primary onClick={() => this.setState({ open_edit_country: true })}>
                Rename country
              </Button>
            </Grid.Column>
          }
          {
            selected_country &&
            <Grid.Column>
              <Button primary onClick={() => this.setState({ open_delete_country: true })}>
                Delete country
              </Button>
            </Grid.Column>
          }
          {
            React.Children.map(children, elem => (
              <Grid.Column>
                {elem}
              </Grid.Column>
            ))
          }
        </Grid.Row>

      </Grid>
    )
  }

  onClose = () => this.setState(this.initialState)
}

const mapStateToProps = (state: AppState) => ({
  selected_country: state.settings.country,
  countries: state.countries
})

const actions = { selectCountry, createCountry, changeCountryName, deleteCountry }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(CountryManager)
