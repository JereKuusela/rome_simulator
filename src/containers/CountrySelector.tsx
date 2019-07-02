import React, { Component } from 'react'
import { connect } from 'react-redux'
import DropdownSelector from '../components/DropdownSelector'
import ValueDropdownModal from '../components/ValueDropdownModal'
import { AppState } from '../store/'
import { CountryName, createCountry, changeCountryName, deleteCountry } from '../store/countries'
import { Grid, Button } from 'semantic-ui-react'
import { selectCountry } from '../store/settings'


interface IState {
  modal_country: CountryName | null
  open_create_country: boolean
  open_create_unit: boolean
  open_edit: boolean
  open_confirm: boolean
}
class CountrySelector extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { modal_country: null, open_create_country: false, open_confirm: false, open_edit: false, open_create_unit: false };
  }

  render(): JSX.Element | null {
    return (
      <Grid>
        <ValueDropdownModal<CountryName, CountryName>
          value={'' as CountryName}
          selected={this.props.active}
          open={this.state.open_create_country}
          onSuccess={this.props.createCountry}
          onClose={this.closeModal}
          items={this.props.countries.keySeq()}
          message='New army'
          button_message='Create'
        />
        <Grid.Row>
          <Grid.Column>
            <DropdownSelector
              items={this.props.countries.keySeq()}
              active={this.props.active}
              onSelect={this.props.selectCountry}
            />
          </Grid.Column>
          <Grid.Column>
          <Button primary onClick={() => this.setState({open_create_country: true})}>
          Create new army
        </Button>
          </Grid.Column>
        </Grid.Row>

      </Grid>
    )
  }
  
  closeModal = (): void => this.setState({ modal_country: null, open_create_country: false, open_confirm: false, open_edit: false, open_create_unit: false  })

}

const mapStateToProps = (state: AppState) => ({
  active: state.settings.country,
  countries: state.countries.selections
})

const mapDispatchToProps = (dispatch: any) => ({
  selectCountry: (country: CountryName) => (dispatch(selectCountry(country))),
  createCountry: (country: CountryName, source_country?: CountryName) => dispatch(createCountry(country, source_country))

})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

export default connect(mapStateToProps, mapDispatchToProps)(CountrySelector)
