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
          items={this.props.countries.keySeq()}
          message='New country'
          button_message='Create'
          value_label='Name '
          dropdown_label='Copy country: '
        />
        <ValueModal
          open={this.state.open_edit_country}
          onSuccess={name => this.props.changeCountryName(this.props.country, name)}
          onClose={this.onClose}
          message='Rename country'
          button_message='Edit'
          initial={this.props.country}
        />
        <Confirmation
          open={this.state.open_delete_country}
          onClose={this.onClose}
          onConfirm={() => this.props.deleteCountry(this.props.country)}
          message={'Are you sure you want to remove country ' + this.props.country + ' ?'}
        />
        <Grid.Row columns='5'>
          <Grid.Column>
            <DropdownSelector
              items={this.props.countries.keySeq()}
              active={this.props.country}
              onSelect={this.props.selectCountry}
            />
          </Grid.Column>
          <Grid.Column>
            <Button primary onClick={() => this.setState({ open_create_country: true })}>
              New country
            </Button>
          </Grid.Column>
          {
            this.props.country &&
            <Grid.Column>
              <Button primary onClick={() => this.setState({ open_edit_country: true })}>
                Rename country
            </Button>
            </Grid.Column>
          }
          {
            this.props.country &&
            <Grid.Column>
              <Button primary onClick={() => this.setState({ open_delete_country: true })}>
                Delete country
            </Button>
            </Grid.Column>
          }
        </Grid.Row>

      </Grid>
    )
  }
  onClose = (): void => this.setState(this.initialState)
}

const mapStateToProps = (state: AppState) => ({
  country: state.settings.country,
  countries: state.countries.selections
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
