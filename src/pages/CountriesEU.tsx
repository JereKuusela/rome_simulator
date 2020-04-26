import React, { Component } from 'react'
import { Container, Grid, Table, Checkbox, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, getGeneralDefinition, getCountryDefinition, getSiteSettings, getCountry, getSelectedArmy } from 'state'
import { mapRange, values } from '../utils'

import { CultureType, CountryAttribute, GeneralAttribute, CombatPhase, GeneralValueType, filterAttributes, ListDefinition, CountryName, Setting, ArmyName } from 'types'
import { clearGeneralSelections, clearCountrySelections, clearCountryAttributes, clearGeneralAttributes, setCountryAttribute, enableCountrySelection, clearCountrySelection, setGeneralAttribute, selectCulture, selectGovernment, setHasGeneral } from 'reducers'

import AccordionToggle from 'containers/AccordionToggle'
import CountryManager from 'containers/CountryManager'
import Dropdown from 'components/Dropdowns/Dropdown'
import TableAttributes from 'components/TableAttributes'
import { getCultures, tech_euiv } from 'data'
import CountryValueInput from 'containers/CountryValueInput'
import ListModifier from 'components/Utils/ListModifier'

const TECH_COLUMNS = 4
const CUSTOM_KEY = 'Base'

const CELL_PADDING = '.78571429em .78571429em'

class Countries extends Component<IProps> {

  render() {
    const { settings, tech, general, country, selectedCountry: selected_country, countryDefinition: country_definition, setHasGeneral } = this.props
    return (
      <Container>
        <CountryManager>
          <Button negative onClick={this.clearAll}>Clear selections</Button>
        </CountryManager>
        <Grid>
          <Grid.Row columns='3'>
            <Grid.Column>
              <Dropdown
                values={getCultures()}
                value={country.culture}
                onChange={item => this.selectCulture(item)}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='General' identifier='countries_traits'>
                <Checkbox
                  toggle
                  label='General'
                  checked={general.enabled}
                  onChange={general.enabled ? () => this.execArmy(setHasGeneral, false) : () => this.execArmy(setHasGeneral, true)}
                  style={{ float: 'right' }}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Tech' identifier='countries_tech'>
                Tech level: <CountryValueInput country={selected_country} attribute={CountryAttribute.TechLevel} />
                {
                  this.renderTech(tech, country[CountryAttribute.TechLevel])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Attributes' identifier='countries_attributes'>
                <TableAttributes attributes={filterAttributes(values(CountryAttribute), settings)} custom_value_key={CUSTOM_KEY} definition={country_definition} onChange={this.setCountryValue} />
                <TableAttributes attributes={filterAttributes((values(GeneralAttribute) as GeneralValueType[]).concat(values(CombatPhase)), settings)} custom_value_key={CUSTOM_KEY} definition={general} onChange={this.setGeneralValue} />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }

  renderTech = (tech: ListDefinition[], tech_level: number) => {
    const rows = Math.ceil(tech.length / TECH_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(TECH_COLUMNS, number => number).map(column => {
                    const index = row * TECH_COLUMNS + column
                    const level = tech[index]
                    const key = 'Tech' + index
                    if (!level)
                      return (<Table.Cell key={key}></Table.Cell>)
                    const enabled = index <= tech_level
                    return (
                      <Table.Cell
                        key={key}
                        positive={enabled}
                        selectable
                        colSpan={1}
                        onClick={
                          enabled
                            ? () => this.clearTech(index)
                            : () => this.enableTech(index)
                        }
                        style={{ padding: CELL_PADDING }}
                      >
                        <ListModifier name={level.name} modifiers={level.modifiers} />
                      </Table.Cell>
                    )
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  /** Executes a given function with currently selected country. */
  execCountry = <T extends any>(func: (country: CountryName, value: T, ...rest: any[]) => void, value: T, ...rest: any[]) => func(this.props.selectedCountry, value, ...rest)
  execArmy = <T extends any>(func: (country: CountryName, army: ArmyName, value: T, ...rest: any[]) => void, value: T, ...rest: any[]) => func(this.props.selectedCountry, this.props.selectedArmy, value, ...rest)

  /**
   * Selects culture while also re-enabling tradition.
   */
  selectCulture = (value: CultureType) => {
    this.execCountry(this.props.selectCulture, value, !this.props.settings[Setting.Culture])
  }
  /**
   * Clears tech above a given tech level.
   */
  clearTech = (level: number) => {
    level = level || 1
    this.execCountry(this.props.setCountryAttribute, CountryAttribute.TechLevel, level - 1)
  }

  /**
   * Enables tech levels to a given level.
   */
  enableTech = (level: number) => {
    this.execCountry(this.props.setCountryAttribute, CountryAttribute.TechLevel, level)
  }

  /**
   * Clears all selections.
   */
  clearAll = () => {
    this.execCountry(this.props.clearCountrySelections, undefined)
    this.execCountry(this.props.clearCountryAttributes, undefined)
    this.execArmy(this.props.clearGeneralSelections, undefined)
    this.execArmy(this.props.clearGeneralAttributes, undefined)
    this.execArmy(this.props.setHasGeneral, true)
  }

  setCountryValue = (_: string, attribute: CountryAttribute, value: number) => this.execCountry(this.props.setCountryAttribute, attribute, value)

  setGeneralValue = (_: string, attribute: GeneralValueType, value: number) => this.execArmy(this.props.setGeneralAttribute, attribute, value)
}

const mapStateToProps = (state: AppState) => {
  const selectedArmy = getSelectedArmy(state)
  return {
    countryDefinition: getCountryDefinition(state, state.settings.country),
    country: getCountry(state, state.settings.country),
    selectedCountry: state.settings.country,
    selectedArmy,
    tech: tech_euiv,
    general: getGeneralDefinition(state, state.settings.country, selectedArmy),
    settings: getSiteSettings(state)
  }
}

const actions = {
  setGeneralAttribute, selectCulture, setCountryAttribute, clearCountryAttributes, clearGeneralAttributes, clearGeneralSelections,
  selectGovernment, setHasGeneral, enableCountrySelection, clearCountrySelection, clearCountrySelections
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Countries)
