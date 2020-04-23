import React, { Component } from 'react'
import { Container, Grid, Table, List, Checkbox } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, getGeneralDefinition, getCountryDefinition, getSiteSettings, getCountry } from 'state'
import { mapRange, values } from '../utils'

import { Modifier, ReligionType, CultureType, ModifierType, CountryAttribute, GeneralAttribute, CombatPhase, GeneralValueType, filterAttributes, ListDefinition, CountryName, Setting } from 'types'
import { clearAllCountrySelections, setCountryValue, enableCountrySelection, clearCountrySelection, setGeneralValue, selectCulture, selectReligion, selectGovernment, setHasGeneral } from 'reducers'

import AccordionToggle from 'containers/AccordionToggle'
import CountryManager from 'containers/CountryManager'
import Dropdown from 'components/Dropdowns/Dropdown'
import ConfirmationButton from 'components/ConfirmationButton'
import TableAttributes from 'components/TableAttributes'
import { getCultures } from 'data'
import { tech_euiv } from 'managers/modifiers'
import CountryValueInput from 'containers/CountryValueInput'

const TECH_COLUMNS = 4
const CUSTOM_KEY = 'Base'

const CELL_PADDING = '.78571429em .78571429em'

class Countries extends Component<IProps> {

  render() {
    const { settings, tech, general, country, selected_country, country_definition, setHasGeneral } = this.props
    return (
      <Container>
        <CountryManager>
          <ConfirmationButton
            message={'Are you sure you want to clear all selections from country ' + selected_country + '?'}
            negative
            text='Clear selections'
            onConfirm={this.clearAll} />
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
                  onChange={general.enabled ? () => this.exec(setHasGeneral, false) : () => this.exec(setHasGeneral, true)}
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
                        {this.renderModifiers(level.name, level.modifiers)}
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

  renderModifiers = (name: string | null, modifiers: Modifier[], padding?: string) => (
    <List>
      {name &&
        <List.Item key='name'>
          <List.Header>
            {name}
          </List.Header>
        </List.Item>
      }
      {
        modifiers.map((modifier, index) => (
          <List.Item key={index}>
            {
              this.getText(modifier)
            }
            {
              this.getValue(modifier, padding)
            }
          </List.Item>
        ))
      }
    </List>
  )

  /**
   * Selects religion while also re-enabling current omen.
   */
  selectReligion = (value: ReligionType) => {
    this.exec(this.props.selectReligion, value)
  }

  /** Executes a given function with currently selected country. */
  exec = <T extends any>(func: (country: CountryName, value: T, ...rest: any[]) => void, value: T, ...rest: any[]) => func(this.props.selected_country, value, ...rest)

  /**
   * Selects culture while also re-enabling tradition.
   */
  selectCulture = (value: CultureType) => {
    this.exec(this.props.selectCulture, value, !this.props.settings[Setting.Culture])
  }
  /**
   * Scales modifier with a given power.
   */
  scaleModifier = (modifier: Modifier, power: number) => ({ ...modifier, value: modifier.value * power / 100.0 })


  /**
   * Clears tech above a given tech level.
   */
  clearTech = (level: number) => {
    level = level || 1
    this.exec(this.props.setCountryValue, 'Base', CountryAttribute.TechLevel, level - 1)
  }

  /**
   * Enables tech levels to a given level.
   */
  enableTech = (level: number) => {
    this.exec(this.props.setCountryValue, 'Base', CountryAttribute.TechLevel, level)
  }

  /**
   * Clears all selections.
   */
  clearAll = () => {
    this.exec(this.props.clearAllCountrySelections, 0)
    this.exec(this.props.setHasGeneral, true)
    this.clearTech(0)
  }

  getText = (modifier: Modifier) => {
    if (modifier.target in ModifierType)
      return <span>{modifier.attribute}</span>
    return <span>{modifier.target + ' ' + modifier.attribute}</span>
  }

  getValue = (modifier: Modifier, padding: string = '') => {
    if (!modifier.value)
      return null
    const sign = modifier.value > 0 ? '+' : '-'
    const value = Math.abs(modifier.value)
    const str = modifier.no_percent ? value + padding : +(value * 100).toFixed(2) + ' %'
    return <span className={modifier.negative ? 'color-negative' : 'color-positive'} style={{ float: 'right' }}>{sign + str}</span>
  }

  getNumberFromKey = (key: string, index: number) => {
    const split = key.split('_')
    if (split.length > index)
      return Number(split[index])
    return -1
  }

  /**
   * Returns the given key without last prefix.
   */
  getUpperKey = (key: string) => {
    const index = key.lastIndexOf('_')
    if (index < 0)
      return ''
    return key.substring(0, index)
  }

  setCountryValue = (key: string, attribute: CountryAttribute, value: number) => {
    const { setCountryValue, selected_country } = this.props
    setCountryValue(selected_country, key, attribute, value)
  }


  setGeneralValue = (key: string, attribute: GeneralValueType, value: number) => {
    const { setGeneralValue } = this.props
    setGeneralValue(this.props.selected_country, key, attribute, value)
  }
}

const mapStateToProps = (state: AppState) => ({
  country_definition: getCountryDefinition(state, state.settings.country),
  country: getCountry(state, state.settings.country),
  selected_country: state.settings.country,
  tech: tech_euiv,
  general: getGeneralDefinition(state, state.settings.country),
  settings: getSiteSettings(state)
})

const actions = {
  setGeneralValue, selectCulture, setCountryValue,
  clearAllCountrySelections, selectReligion, selectGovernment, setHasGeneral, enableCountrySelection, clearCountrySelection
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Countries)
