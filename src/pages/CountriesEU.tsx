import React, { Component } from 'react'
import { Container, Grid, Table, List, Input, Checkbox } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, getGeneral, getSettings } from 'state'
import { mapRange, ObjSet, has, values } from '../utils'

import { addSignWithZero } from 'formatters'
import { ValuesType, Modifier, ScopeType, UnitAttribute, ReligionType, CultureType, ModifierType, CountryAttribute, Mode, GeneralAttribute, CombatPhase, GeneralValueType, filterAttributes, TechDefinitionEUIV } from 'types'
import { invalidate, setCountryValue, setTechLevel, enableSelection, clearSelection, enableUnitModifiers, enableGeneralModifiers, clearUnitModifiers, clearGeneralModifiers, setGeneralMartial, setGeneralValue, selectCulture, selectReligion, selectGovernment, setHasGeneral } from 'reducers'

import AccordionToggle from 'containers/AccordionToggle'
import CountryManager from 'containers/CountryManager'
import Dropdown from 'components/Utils/Dropdown'
import ConfirmationButton from 'components/ConfirmationButton'
import StyledNumber from 'components/Utils/StyledNumber'
import TableAttributes from 'components/TableAttributes'
import { getBaseUnitType } from 'managers/units'
import { getGeneralStats } from 'managers/army'
import { getCultures } from 'data'

const TECH_COLUMNS = 4
const TECH_KEY = 'Tech_'
const NO_GENERAL_KEY = 'No general'

const KEYS = [TECH_KEY, NO_GENERAL_KEY]

const CELL_PADDING = '.78571429em .78571429em'

class Countries extends Component<IProps> {

  render() {
    const { settings, tech, general, countries, selected_country } = this.props
    const country = countries[selected_country]
    const selections = country.selections
    const stats = getGeneralStats(general)
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
                  checked={general.enabled}
                  onChange={general.enabled ? this.disableGeneral : this.enableGeneral}
                  style={{ float: 'right' }}
                />
                Base martial: <Input disabled={!general.enabled} type='number' value={stats.base_martial} onChange={(_, { value }) => this.setGeneralMartial(value)} />
                {' '}with <StyledNumber value={stats.trait_martial} formatter={addSignWithZero} /> from traits
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
                <TableAttributes attributes={filterAttributes((values(GeneralAttribute) as GeneralValueType[]).concat(values(CombatPhase)), settings)} custom_value_key='Custom' definition={general} onChange={this.setGeneralValue} />
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
    this.props.selectReligion(value)
  }

  /**
   * Selects culture while also re-enabling tradition.
   */
  selectCulture = (value: CultureType) => {
    this.props.selectCulture(value)
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
    this.props.setTechLevel(level - 1)
  }

  /**
   * Enables tech levels to a given level.
   */
  enableTech = (tech: TechDefinitionEUIV[], level: number, selections: ObjSet) => {
    mapRange(level + 1, number => number).filter(value => !has(selections, TECH_KEY + value))
      .forEach(value => this.enableModifiers(TECH_KEY + value, tech[value].modifiers))
    this.props.setTechLevel(level)
  }

  /**
   * Clears all selections.
   */
  clearAll = (selections: ObjSet) => {
    KEYS.forEach(key => this.clearModifiersStartingWith(key, selections))
    this.props.setHasGeneral(this.props.selected_country, true)
    this.props.setGeneralMartial(this.props.selected_country, 0)
  }

  /**
   * Sets generals martial skill level.
   */
  setGeneralMartial = (value: string) => {
    const skill = Number(value)
    if (isNaN(skill))
      return
    this.props.setGeneralMartial(this.props.selected_country, skill)
  }
  /**
   * Toggles has general while removing no general debuff.
   */
  enableGeneral = () => {
    this.clearModifiers(NO_GENERAL_KEY)
    this.props.setHasGeneral(this.props.selected_country, true)
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
    this.props.setHasGeneral(this.props.selected_country, false)
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
    enableSelection(key)
    invalidate()
  }

  clearModifiers = (key: string) => {
    const { clearGeneralModifiers, clearUnitModifiers, clearSelection, invalidate, selected_country } = this.props
    clearGeneralModifiers(selected_country, key)
    clearUnitModifiers(key)
    clearSelection(key)
    invalidate()
  }

  setCountryValue = (key: string, attribute: CountryAttribute, value: number) => {
    const { setCountryValue, invalidate } = this.props
    setCountryValue(key, attribute, value)
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
  general: getGeneral(state, state.settings.country),
  settings: getSettings(state)
})

const actions = {
  enableGeneralModifiers, clearGeneralModifiers, clearUnitModifiers, enableUnitModifiers, setGeneralMartial, setGeneralValue, selectCulture, invalidate, setCountryValue,
  selectReligion, selectGovernment, setHasGeneral, enableSelection, clearSelection, setTechLevel
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Countries)
