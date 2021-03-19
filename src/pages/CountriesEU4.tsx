import React, { Component } from 'react'
import { Container, Grid, Table, Checkbox, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import {
  AppState,
  getGeneralDefinition,
  getCountryDefinition,
  getSiteSettings,
  getCountry,
  getSelectedArmy
} from 'state'
import { mapRange, values } from '../utils'

import {
  CountryAttribute,
  GeneralAttribute,
  CombatPhase,
  GeneralValueType,
  filterAttributes,
  ListDefinition,
  CountryName,
  ArmyName,
  SelectionType
} from 'types'
import {
  clearGeneralSelections,
  clearCountrySelections,
  clearCountryAttributes,
  clearGeneralAttributes,
  setCountryAttribute,
  enableCountrySelection,
  clearCountrySelection,
  setGeneralAttribute,
  selectCulture,
  selectGovernment,
  setHasGeneral
} from 'reducers'

import AccordionToggle from 'containers/AccordionToggle'
import CountryManager from 'containers/CountryManager'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import TableAttributes from 'components/TableAttributes'
import { getCultures, policiesEU4, techEU4 } from 'data'
import CountryValueInput from 'containers/CountryValueInput'
import ListModifier from 'components/Utils/ListModifier'
import { TableModifierList } from 'components/TableModifierList'

const TECH_COLUMNS = 4
const CUSTOM_KEY = 'Base'

const CELL_PADDING = '.78571429em .78571429em'

class CountriesEU4 extends Component<IProps> {
  render() {
    const { settings, general, country, selectedCountry, countryDefinition, setHasGeneral } = this.props
    return (
      <Container>
        <CountryManager>
          <Button negative onClick={this.clearAll}>
            Clear selections
          </Button>
        </CountryManager>
        <Grid>
          <Grid.Row columns='3'>
            <Grid.Column>
              <SimpleDropdown values={getCultures()} value={country.culture} onChange={item => item} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='General' identifier='countriesTraits'>
                <Checkbox
                  toggle
                  label='General'
                  checked={general.enabled}
                  onChange={
                    general.enabled
                      ? () => this.execArmy(setHasGeneral, false)
                      : () => this.execArmy(setHasGeneral, true)
                  }
                  style={{ float: 'right' }}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Tech' identifier='countriesTech'>
                Tech level: <CountryValueInput country={selectedCountry} attribute={CountryAttribute.MartialTech} />
                {this.renderTech(techEU4, country[CountryAttribute.MartialTech])}
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Policies' identifier='countriesPolicies'>
                <TableModifierList
                  selections={country.selections[SelectionType.Policy]}
                  columns={3}
                  usePercentPadding
                  type={SelectionType.Policy}
                  onClick={this.onCountryItemClick}
                  items={values(policiesEU4)}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Attributes' identifier='countriesAttributes'>
                <TableAttributes
                  attributes={filterAttributes(values(CountryAttribute), settings)}
                  customValueKey={CUSTOM_KEY}
                  definition={countryDefinition.modifiers}
                  onChange={this.setCountryValue}
                />
                <TableAttributes
                  attributes={filterAttributes(
                    (values(GeneralAttribute) as GeneralValueType[]).concat(values(CombatPhase)),
                    settings
                  )}
                  customValueKey={CUSTOM_KEY}
                  definition={general}
                  onChange={this.setGeneralValue}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }

  renderTech = (tech: ListDefinition[], techLevel: number) => {
    const rows = Math.ceil(tech.length / TECH_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {mapRange(rows, number => number).map(row => (
            <Table.Row key={row}>
              {mapRange(TECH_COLUMNS, number => number).map(column => {
                const index = row * TECH_COLUMNS + column
                const level = tech[index]
                const key = 'Tech' + index
                if (!level) return <Table.Cell key={key}></Table.Cell>
                const enabled = index <= techLevel
                return (
                  <Table.Cell
                    key={key}
                    positive={enabled}
                    selectable
                    colSpan={1}
                    onClick={enabled ? () => this.clearTech(index) : () => this.enableTech(index)}
                    style={{ padding: CELL_PADDING }}
                  >
                    <ListModifier name={level.name} modifiers={level.modifiers} />
                  </Table.Cell>
                )
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  /** Executes a given function with currently selected country. */
  execCountry = <T1, T2>(func: (country: CountryName, value: T1, ...rest: T2[]) => void, value: T1, ...rest: T2[]) =>
    func(this.props.selectedCountry, value, ...rest)
  execArmy = <T1, T2>(
    func: (country: CountryName, army: ArmyName, value: T1, ...rest: T2[]) => void,
    value: T1,
    ...rest: T2[]
  ) => func(this.props.selectedCountry, this.props.selectedArmy, value, ...rest)

  /**
   * Clears tech above a given tech level.
   */
  clearTech = (level: number) => {
    level = level || 1
    this.execCountry(this.props.setCountryAttribute, CountryAttribute.MartialTech, level - 1)
  }

  /**
   * Enables tech levels to a given level.
   */
  enableTech = (level: number) => {
    this.execCountry(this.props.setCountryAttribute, CountryAttribute.MartialTech, level)
  }

  onCountryItemClick = (enabled: boolean) => (enabled ? this.clearCountrySelection : this.enableCountrySelection)

  enableCountrySelection = (type: SelectionType, key: string) => {
    const { enableCountrySelection } = this.props
    this.execCountry(enableCountrySelection, type, key)
  }

  clearCountrySelection = (type: SelectionType, key: string) => {
    const { clearCountrySelection } = this.props
    this.execCountry(clearCountrySelection, type, key)
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

  setCountryValue = (_: string, attribute: CountryAttribute, value: number) =>
    this.execCountry(this.props.setCountryAttribute, attribute, value)

  setGeneralValue = (_: string, attribute: GeneralValueType, value: number) =>
    this.execArmy(this.props.setGeneralAttribute, attribute, value)
}

const mapStateToProps = (state: AppState) => {
  const selectedArmy = getSelectedArmy(state)
  return {
    countryDefinition: getCountryDefinition(state, state.settings.country),
    country: getCountry(state, state.settings.country),
    selectedCountry: state.settings.country,
    selectedArmy,
    general: getGeneralDefinition(state, state.settings.country, selectedArmy),
    settings: getSiteSettings(state)
  }
}

const actions = {
  setGeneralAttribute,
  selectCulture,
  setCountryAttribute,
  clearCountryAttributes,
  clearGeneralAttributes,
  clearGeneralSelections,
  selectGovernment,
  setHasGeneral,
  enableCountrySelection,
  clearCountrySelection,
  clearCountrySelections
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(CountriesEU4)
