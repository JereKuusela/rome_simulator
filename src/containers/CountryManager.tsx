import React, { Component } from 'react'
import { connect } from 'react-redux'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import ValueDropdownModal from 'components/ValueDropdownModal'
import { AppState, getArmies, getMode } from 'state'
import { Grid, Button } from 'semantic-ui-react'
import { CountryName, ModalType, ArmyName } from 'types'
import { keys } from 'utils'
import { createCountry, changeCountryName, deleteCountry, createArmy, changeArmyName, deleteArmy, selectCountry, selectArmy, openModal } from 'reducers'

interface IState {
  openCreateCountry: boolean
  openCreateArmy: boolean
}

class CountryManager extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = this.initialState
  }

  initialState = { openCreateCountry: false, openCreateArmy: false }

  render() {
    const { countries, selectedCountry, selectedArmy, selectCountry, armies, selectArmy, children } = this.props
    const { openCreateCountry, openCreateArmy } = this.state
    return (
      <Grid>
        <ValueDropdownModal
          value={'' as CountryName}
          selected={'' as CountryName}
          open={openCreateCountry}
          onSuccess={this.createCountry}
          onClose={this.onClose}
          items={keys(countries)}
          message='New country'
          buttonMessage='Create'
          valueLabel='Name '
          dropdownLabel='Copy country: '
        />
        <ValueDropdownModal
          value={'' as ArmyName}
          selected={'' as ArmyName}
          open={openCreateArmy}
          onSuccess={this.createArmy}
          onClose={this.onClose}
          items={armies}
          message='New army'
          buttonMessage='Create'
          valueLabel='Name '
          dropdownLabel='Copy army: '
        />
        <Grid.Row columns='5'>
          <Grid.Column>
            <SimpleDropdown
              values={keys(countries)}
              value={selectedCountry}
              onChange={name => selectCountry(name)}
            />
          </Grid.Column>
          <Grid.Column>
            <Button primary onClick={() => this.setState({ openCreateCountry: true })}>
              New country
            </Button>
          </Grid.Column>
          {
            selectedCountry &&
            <Grid.Column>
              <Button primary onClick={this.openEditCountry}>
                Rename country
              </Button>
            </Grid.Column>
          }
          {
            selectedCountry &&
            <Grid.Column>
              <Button primary onClick={this.deleteCountry}>
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
        <Grid.Row columns='5'>
          <Grid.Column>
            <SimpleDropdown
              values={armies.map((key, index) => ({ text: key, value: index }))}
              value={selectedArmy}
              onChange={selectArmy}
            />
          </Grid.Column>
          <Grid.Column>
            <Button primary onClick={() => this.setState({ openCreateArmy: true })}>
              New army
            </Button>
          </Grid.Column>
          <Grid.Column>
            <Button primary onClick={this.openEditArmy}>
              Rename army
            </Button>
          </Grid.Column>
          <Grid.Column>
            <Button primary onClick={this.deleteArmy} disabled={armies.length < 2}>
              Delete army
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  openEditCountry = () => this.props.openModal(ModalType.Value, {
    onSuccess: country => this.changeCountryName(country as CountryName),
    message: 'Rename country',
    buttonMessage: 'Edit',
    initial: this.props.selectedCountry
  })

  openEditArmy = () => this.props.openModal(ModalType.Value, {
    onSuccess: army => this.changeArmyName(army as ArmyName),
    message: 'Rename army',
    buttonMessage: 'Edit',
    initial: this.props.armies[this.props.selectedArmy]
  })

  onClose = () => this.setState(this.initialState)

  createCountry = (country: CountryName, source?: CountryName) => {
    const { selectCountry, createCountry } = this.props
    createCountry(country, source)
    selectCountry(country)
  }

  deleteCountry = () => {
    const { selectCountry, deleteCountry, selectedCountry } = this.props
    deleteCountry(selectedCountry)
    selectCountry('' as CountryName)
  }

  changeCountryName = (country: CountryName) => {
    const { selectCountry, changeCountryName, selectedCountry } = this.props
    changeCountryName(selectedCountry, country)
    selectCountry(country)
  }

  createArmy = (army: ArmyName, sourceArmy?: ArmyName) => {
    const { createArmy, selectArmy, mode, selectedCountry, armies } = this.props
    createArmy(selectedCountry, army, mode, sourceArmy)
    selectArmy(armies.length)
  }

  deleteArmy = () => {
    const { selectArmy, deleteArmy, selectedArmy, selectedCountry, armies } = this.props
    deleteArmy(selectedCountry, armies[selectedArmy])
    selectArmy(selectedArmy - 1)
  }

  changeArmyName = (army: ArmyName) => {
    const { changeArmyName, armies, selectedArmy, selectedCountry } = this.props
    changeArmyName(selectedCountry, armies[selectedArmy], army)
  }
}

const mapStateToProps = (state: AppState) => ({
  selectedCountry: state.settings.country,
  countries: state.countries,
  selectedArmy: state.settings.army,
  armies: keys(getArmies(state)),
  mode: getMode(state)
})

const actions = { selectCountry, createCountry, changeCountryName, deleteCountry, openModal, selectArmy, deleteArmy, changeArmyName, createArmy }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<{}>, S, D { }

export default connect(mapStateToProps, actions)(CountryManager)
