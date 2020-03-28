import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dropdown from 'components/Dropdowns/Dropdown'
import ValueDropdownModal from 'components/ValueDropdownModal'
import ValueModal from 'components/ValueModal'
import { AppState } from 'state'
import { Grid, Button } from 'semantic-ui-react'
import Confirmation from 'components/Confirmation'
import { CountryName } from 'types'
import { keys } from 'utils'
import { createCountry, changeCountryName, deleteCountry, selectCountry } from 'reducers'

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
    const { countries, selected_country, selectCountry, children } = this.props
    const { open_create_country, open_edit_country, open_delete_country } = this.state
    return (
      <Grid>
        <ValueDropdownModal
          value={'' as CountryName}
          selected={'' as CountryName}
          open={open_create_country}
          onSuccess={this.createCountry}
          onClose={this.onClose}
          items={keys(countries)}
          message='New country'
          button_message='Create'
          value_label='Name '
          dropdown_label='Copy country: '
        />
        <ValueModal
          open={open_edit_country}
          onSuccess={this.changeCountryName}
          onClose={this.onClose}
          message='Rename country'
          button_message='Edit'
          initial={selected_country}
        />
        <Confirmation
          open={open_delete_country}
          onClose={this.onClose}
          onConfirm={this.deleteCountry}
          message={'Are you sure you want to remove country ' + selected_country + ' ?'}
        />
        <Grid.Row columns='5'>
          <Grid.Column>
            <Dropdown
              values={keys(countries)}
              value={selected_country}
              onChange={selectCountry}
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

  createCountry = (country: CountryName, source_country?: CountryName) => {
    const { selectCountry, createCountry } = this.props
    createCountry(country, source_country)
    selectCountry(country)
  }

  deleteCountry = () => {
    const { selectCountry, deleteCountry, selected_country } = this.props
    deleteCountry(selected_country)
    selectCountry('' as CountryName)
  }

  changeCountryName = (country: CountryName) => {
    const { selectCountry, changeCountryName, selected_country } = this.props
    changeCountryName(selected_country, country)
    selectCountry(country)
  }
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
