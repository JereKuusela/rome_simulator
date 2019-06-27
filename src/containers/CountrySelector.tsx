import React, { Component } from 'react'
import { connect } from 'react-redux'
import DropdownSelector from '../components/DropdownSelector'
import { AppState } from '../store/'
import { selectCountry } from '../store/settings'
import { CountryName } from '../store/countries'


class CountrySelector extends Component<IProps> {

  render(): JSX.Element | null {
    return (
      <DropdownSelector
        items={this.props.countries.keySeq()}
        active={this.props.active}
        onSelect={this.props.selectCountry}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  active: state.settings.country,
  countries: state.countries.selections
})

const mapDispatchToProps = (dispatch: any) => ({
  selectCountry: (country: CountryName) => (dispatch(selectCountry(country)))

})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

export default connect(mapStateToProps, mapDispatchToProps)(CountrySelector)
