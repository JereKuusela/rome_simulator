import React, { Component } from 'react'
import { Container, Grid, Table, List, Checkbox } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, getSettings, getGeneralDefinition } from 'state'
import { mapRange, ObjSet, has, values } from '../utils'

import { ValuesType, Modifier, ScopeType, UnitAttribute, ReligionType, CultureType, ModifierType, CountryAttribute, Mode, GeneralAttribute, CombatPhase, GeneralValueType, filterAttributes, TechDefinitionEUIV, CountryName, Setting } from 'types'
import { invalidate, setCountryValue, setTechLevel, enableSelection, clearSelection, enableUnitModifiers, enableGeneralModifiers, clearUnitModifiers, clearGeneralModifiers, setGeneralValue, selectCulture, selectReligion, selectGovernment, setHasGeneral } from 'reducers'

import AccordionToggle from 'containers/AccordionToggle'
import CountryManager from 'containers/CountryManager'
import Dropdown from 'components/Utils/Dropdown'
import ConfirmationButton from 'components/ConfirmationButton'
import TableAttributes from 'components/TableAttributes'
import { getBaseUnitType } from 'managers/units'
import { getCultures } from 'data'

const TECH_COLUMNS = 4
const TECH_KEY = 'Tech_'
const NO_GENERAL_KEY = 'No general'

const KEYS = [TECH_KEY, NO_GENERAL_KEY]

const CELL_PADDING = '.78571429em .78571429em'

class Countries extends Component<IProps> {

  render() {
    const { settings, tech, general_definition, countries, selected_country } = this.props
    const country = countries[selected_country]
    const selections = country.selections
    return (
      <Container>
        <CountryManager>
          <ConfirmationButton
            message={'Are you sure you want to clear all selections from country ' + selected_country + '?'}
            negative
            text='Clear selections'
            onConfirm={() => this.clearAll(selections)} />
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
                  checked={general_definition.enabled}
                  onChange={general_definition.enabled ? this.disableGeneral : this.enableGeneral}
                  style={{ float: 'right' }}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Trade' identifier='countries_trade'>
                {
                  this.renderTech(tech, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Attributes' identifier='countries_attributes'>
                <TableAttributes attributes={filterAttributes(values(CountryAttribute), settings)} custom_value_key='Custom' definition={country} onChange={this.setCountryValue} />
                <TableAttributes attributes={filterAttributes((values(GeneralAttribute) as GeneralValueType[]).concat(values(CombatPhase)), settings)} custom_value_key='Custom' definition={general_definition} onChange={this.setGeneralValue} />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }

  renderTech = (tech: TechDefinitionEUIV[], selections: ObjSet) => {
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
                    if (!level)
                      return (<Table.Cell key={TECH_KEY + index}></Table.Cell>)
                    const key = TECH_KEY + index
                    return this.renderCell(key, level.name, selections, level.modifiers,
                      () => this.enableTech(tech, index, selections), () => this.clearTech(index, selections))
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  renderCell = (key: string, name: string | null, selections: ObjSet, modifiers: Modifier[], enable?: (() => void), clear?: (() => void), padding?: string, disabled?: boolean, width?: number) => (
    <Table.Cell
      disabled={disabled}
      key={key}
      positive={has(selections, key)}
      selectable
      colSpan={width || 1}
      onClick={
        has(selections, key)
          ? (clear ? clear : () => this.clearModifiers(key))
          : (enable ? enable : () => this.enableModifiers(key, modifiers))
      }
      style={{ padding: CELL_PADDING }}
    >
      {this.renderModifiers(name, modifiers, padding)}
    </Table.Cell>
  )

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
   * Clears modifiers starting with a given key.
   */
  clearModifiersStartingWith = (key: string, selections: ObjSet) => {
    Object.keys(selections).filter(value => value.startsWith(key)).forEach(value => this.clearModifiers(value))
  }
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
  clearTech = (level: number, selections: ObjSet) => {
    level = level || 1
    Object.keys(selections).filter(value => value.startsWith(TECH_KEY) && this.getNumberFromKey(value, 1) >= level)
      .forEach(value => this.clearModifiers(value))
    this.exec(this.props.setTechLevel, level - 1)
  }

  /**
   * Enables tech levels to a given level.
   */
  enableTech = (tech: TechDefinitionEUIV[], level: number, selections: ObjSet) => {
    mapRange(level + 1, number => number).filter(value => !has(selections, TECH_KEY + value))
      .forEach(value => this.enableModifiers(TECH_KEY + value, tech[value].modifiers))
    this.exec(this.props.setTechLevel, level)
  }

  /**
   * Clears all selections.
   */
  clearAll = (selections: ObjSet) => {
    KEYS.forEach(key => this.clearModifiersStartingWith(key, selections))
    this.exec(this.props.setHasGeneral, true)
    this.exec(this.props.setTechLevel, 0)
  }

  /**
   * Toggles has general while removing no general debuff.
   */
  enableGeneral = () => {
    this.clearModifiers(NO_GENERAL_KEY)
    this.exec(this.props.setHasGeneral, true)
  }

  /**
   * Toggles has general while enabling no general debuff.
   */
  disableGeneral = () => {
    this.enableModifiers(NO_GENERAL_KEY, [{
      target: ModifierType.Global,
      scope: ScopeType.Army,
      attribute: UnitAttribute.Morale,
      type: ValuesType.Modifier,
      value: -0.25
    }])
    this.exec(this.props.setHasGeneral, false)
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


  mapModifiersToUnits = (modifiers: Modifier[]) => {
    const mapped: Modifier[] = []
    modifiers.forEach(modifier => {
      if (modifier.target === ModifierType.Text)
        return
      if (modifier.target in Mode) {
        mapped.push({ ...modifier, target: getBaseUnitType(modifier.target as Mode) })
        return
      }
      if (modifier.target === ModifierType.Global) {
        mapped.push({ ...modifier, target: getBaseUnitType(Mode.Naval) })
        mapped.push({ ...modifier, target: getBaseUnitType(Mode.Land) })
        return
      }
      mapped.push(modifier)
    })
    return mapped
  }

  enableModifiers = (key: string, modifiers: Modifier[]) => {
    const { enableGeneralModifiers, enableUnitModifiers, enableSelection, invalidate, selected_country } = this.props
    modifiers = this.mapModifiersToUnits(modifiers)
    enableGeneralModifiers(selected_country, key, modifiers)
    enableUnitModifiers(key, modifiers)
    enableSelection(selected_country, key)
    invalidate()
  }

  clearModifiers = (key: string) => {
    const { clearGeneralModifiers, clearUnitModifiers, clearSelection, invalidate, selected_country } = this.props
    clearGeneralModifiers(selected_country, key)
    clearUnitModifiers(key)
    clearSelection(selected_country, key)
    invalidate()
  }

  setCountryValue = (key: string, attribute: CountryAttribute, value: number) => {
    const { setCountryValue, selected_country, invalidate } = this.props
    setCountryValue(selected_country, key, attribute, value)
    invalidate()
  }


  setGeneralValue = (key: string, attribute: GeneralValueType, value: number) => {
    const { setGeneralValue, invalidate } = this.props
    setGeneralValue(this.props.selected_country, key, attribute, value)
    invalidate()
  }
}

const mapStateToProps = (state: AppState) => ({
  countries: state.countries,
  selected_country: state.settings.country,
  tech: state.data.tech_euiv,
  general_definition: getGeneralDefinition(state, state.settings.country),
  settings: getSettings(state)
})

const actions = {
  enableGeneralModifiers, clearGeneralModifiers, clearUnitModifiers, enableUnitModifiers, setGeneralValue, selectCulture, invalidate, setCountryValue,
  selectReligion, selectGovernment, setHasGeneral, enableSelection, clearSelection, setTechLevel
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Countries)
