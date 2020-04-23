import React, { Component } from 'react'
import { Container, Grid, Table, List, Input, Checkbox } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, getGeneral, getGeneralDefinition, getSiteSettings } from 'state'
import { mapRange, ObjSet, keys, values } from '../utils'

import { addSignWithZero } from 'formatters'
import {
  TraditionDefinition, TradeDefinition, OmenDefinition, ListDefinition,
  OptionDefinition, Modifier, ReligionType, CultureType, ModifierType, CountryAttribute, GeneralAttribute, CombatPhase, GeneralValueType, filterAttributes, CountryName, Setting, SelectionType, TechDefinition
} from 'types'
import {
  clearCountryValues, clearAllCountrySelections, setCountryValue, enableCountrySelections, enableCountrySelection, clearCountrySelections, clearCountrySelection,
  setGeneralStat, setGeneralValue, selectCulture, selectReligion, selectGovernment, setHasGeneral,
  clearAllGeneralSelections, clearGeneralSelection, enableGeneralSelection, clearGeneralSelections
} from 'reducers'

import AccordionToggle from 'containers/AccordionToggle'
import CountryManager from 'containers/CountryManager'
import Dropdown from 'components/Dropdowns/Dropdown'
import ConfirmationButton from 'components/ConfirmationButton'
import StyledNumber from 'components/Utils/StyledNumber'
import TableAttributes from 'components/TableAttributes'
import { tech_ir, abilities_ir, traits_ir, heritages_ir, traditions_ir, ideas_ir, policies_ir, laws_ir } from 'managers/modifiers'
import { convertCountryDefinition } from 'managers/countries'
import CountryValueInput from 'containers/CountryValueInput'

const OMEN_COLUMNS = 4
const OMEN_KEY = 'Omen_'

const PERCENT_PADDING = '\u00a0\u00a0\u00a0\u00a0'

const CELL_PADDING = '.78571429em .78571429em'

class Countries extends Component<IProps> {

  render() {
    const { settings, general_definition, general, trades, selected_country, setHasGeneral,
      omens, country_definition, country } = this.props
    const selections = country_definition.selections
    const tradition = traditions_ir[country.culture]
    const omen = omens[country.religion]
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
                values={Object.values(traditions_ir).map(tradition => ({ value: tradition.key, text: tradition.name }))}
                value={country.culture}
                onChange={this.selectCulture}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                values={keys(omens)}
                value={country.religion}
                onChange={this.selectReligion}
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
                Base martial: <Input disabled={!general.enabled} type='number' value={general.base_values[GeneralAttribute.Martial]} onChange={(_, { value }) => this.setGeneralMartial(value)} />
                {' '}with <StyledNumber value={general.extra_values[GeneralAttribute.Martial]} formatter={addSignWithZero} /> from traits
                {
                  this.renderTraits(traits_ir, general.selections[SelectionType.Trait], !general.enabled)
                }
                {
                  this.renderAbilities(abilities_ir, general.selections[SelectionType.Ability])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title={'Traditions (' + tradition.name + ')'} identifier='countries_tradition'>
                Military experience: <CountryValueInput attribute={CountryAttribute.MilitaryExperience} country={selected_country} />
                {
                  this.renderTraditions(tradition, selections[SelectionType.Tradition])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Trade' identifier='countries_trade'>
                {
                  this.renderTrades(trades, selections[SelectionType.Trade])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Technology & Inventions' identifier='countries_invention'>
                {
                  this.renderInventions(tech_ir, country[CountryAttribute.TechLevel], selections[SelectionType.Invention])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title={'Omens (' + country.religion + ')'} identifier='countries_omen'>
                Omen power: <CountryValueInput attribute={CountryAttribute.OmenPower} country={selected_country} />
                <List bulleted style={{ marginLeft: '2rem' }}>
                  <List.Item>Religional unity: 0 - 100</List.Item>
                  <List.Item>Tech level: 0 - 50</List.Item>
                  <List.Item>Inventions: 0 - 30</List.Item>
                  <List.Item>Office: 0 - 30</List.Item>
                  <List.Item>Mandated Observance: 20</List.Item>
                  <List.Item>Latin tradition: 15</List.Item>
                  <List.Item>Exporting Incense: 10</List.Item>
                  <List.Item>Laws: -15 / 15</List.Item>
                  <List.Item>Ruler: -15 / 7.5)</List.Item>
                  <List.Item>Heritage: 0 / 5)</List.Item>
                  <List.Item><b>Total: From -30 to 300</b></List.Item>
                </List>
                {
                  this.renderOmens(omen, selections[SelectionType.Omen], country[CountryAttribute.OmenPower])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Government, Economy & Ideas' identifier='countries_government'>
                <Table fixed singleLine basic='very' style={{ paddingLeft: '0.785714em' }}>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>
                        Republic Discipline (0 - 7.5): <CountryValueInput attribute={CountryAttribute.OfficeDiscipline} country={selected_country} />
                      </Table.Cell>
                      <Table.Cell>
                        Monarch Land Morale (0 - 15): <CountryValueInput attribute={CountryAttribute.OfficeMorale} country={selected_country} />
                      </Table.Cell>
                      <Table.Cell />
                    </Table.Row>
                  </Table.Body>
                </Table>
                {
                  this.renderLaws(laws_ir, selections[SelectionType.Law])
                }
                {
                  this.renderPolicies(policies_ir, selections[SelectionType.Policy])
                }
                {
                  this.renderIdeas(ideas_ir, selections[SelectionType.Idea])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Heritage' identifier='countries_heritage'>
                {
                  this.renderHeritages(heritages_ir, selections[SelectionType.Heritage])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Attributes' identifier='countries_attributes'>
                <TableAttributes attributes={filterAttributes(values(CountryAttribute), settings)} custom_value_key='Base' definition={country_definition} onChange={this.setCountryValue} />
                <TableAttributes attributes={filterAttributes((values(GeneralAttribute) as GeneralValueType[]).concat(values(CombatPhase)), settings)} custom_value_key='Base' definition={general_definition} onChange={this.setGeneralValue} />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }

  renderTraditions = (traditions: TraditionDefinition, selections: ObjSet) => {
    const rows = traditions.paths.reduce((max, path) => Math.max(max, path.traditions.length), 0)
    return (
      <Table celled unstackable fixed>
        <Table.Header>
          <Table.Row>
            {
              traditions.paths.map(path => (
                <Table.HeaderCell key={path.name}>
                  {path.name}
                </Table.HeaderCell>
              ))
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row key={'base'} textAlign='center'>
            {
              this.renderCell('base', null, !!selections, traditions.modifiers,
                this.activateTradition, this.deactivateTradition, undefined, undefined, 3)
            }
          </Table.Row>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  traditions.paths.map(path => {
                    const tradition = path.traditions[row]
                    if (!tradition)
                      return null
                    const key = tradition.key
                    const modifiers = tradition.modifiers
                    return this.renderCell(key, null, selections && selections[key], modifiers,
                      () => this.enableTradition(path.traditions, key), () => this.clearTradition(path.traditions, key))
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
    )
  }

  renderInventions = (inventions: TechDefinition[], tech: number, selections: ObjSet) => {
    return (
      <Table celled unstackable definition fixed>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
            </Table.HeaderCell>
            <Table.HeaderCell>
              Technology
            </Table.HeaderCell>
            <Table.HeaderCell>
              Invention
            </Table.HeaderCell>
            <Table.HeaderCell>
              Invention
            </Table.HeaderCell>
            <Table.HeaderCell>
              Invention
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            inventions.map((definition, row) => (
              <Table.Row key={row}>
                <Table.Cell>
                  {definition.name}
                </Table.Cell>
                {
                  definition.inventions.map((invention, column) => {
                    if (column === 0)
                      return this.renderTechLevel(row, row <= tech, invention.modifiers)
                    const key = invention.key
                    return this.renderCell(key, null, selections && selections[key] && row <= tech, invention.modifiers,
                      () => this.enableInvention(key, row), () => this.clearInvention(key), PERCENT_PADDING)
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
    )
  }

  renderOmens = (omens: OmenDefinition[], selections: ObjSet, power: number) => {
    const rows = Math.ceil(omens.length / OMEN_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(OMEN_COLUMNS, number => number).map(column => {
                    const index = row * OMEN_COLUMNS + column
                    const omen = omens[index]
                    const key = OMEN_KEY + index
                    if (!omen)
                      return (<Table.Cell key={key}></Table.Cell>)
                    const modifiers = [{ ...omen.modifier, value: omen.modifier.value * power / 100.0 }]
                    return this.renderCell(key, omen.name, selections && selections[key], modifiers, () => this.enableOmen(key, modifiers, selections))
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }


  renderTraits = (traits: ListDefinition[], selections: ObjSet, disabled: boolean) => this.renderList(SelectionType.Trait, traits, selections, 4, this.onGeneralItemClick, disabled)
  renderHeritages = (heritages: ListDefinition[], selections: ObjSet) => this.renderList(SelectionType.Heritage, heritages, selections, 4, this.onCountryItemClick, false, PERCENT_PADDING)
  renderTrades = (trades: TradeDefinition[], selections: ObjSet) => this.renderList(SelectionType.Trade, trades, selections, 3, this.onCountryItemClick, false, PERCENT_PADDING)
  renderIdeas = (ideas: ListDefinition[], selections: ObjSet) => this.renderList(SelectionType.Idea, ideas, selections, 3, this.onCountryItemClick, false, PERCENT_PADDING)
  renderLaws = (laws: ListDefinition[], selections: ObjSet) => this.renderList(SelectionType.Law, laws, selections, 3, this.onCountryItemClick, false, PERCENT_PADDING)

  renderList = (type: SelectionType, items: ListDefinition[], selections: ObjSet, columns: number, onClick: (enabled: boolean) => ((type: SelectionType, key: string) => void), disabled: boolean, padding?: string) => {
    items = items.filter(entity => entity.modifiers.length)
    const rows = Math.ceil(items.length / columns)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(columns, number => number).map(column => {
                    const index = row * columns + column
                    const entity = items[index]
                    if (!entity)
                      return (<Table.Cell key={index}></Table.Cell>)
                    const modifiers = entity.modifiers
                    const key = entity.key
                    return this.renderCell2(type, key, entity.name, selections && selections[key], modifiers, onClick, padding, disabled)
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  renderPolicies = (policies: OptionDefinition[], selections: ObjSet) => this.renderOptions(SelectionType.Policy, policies, selections, 3, this.onCountryItemClick, false, PERCENT_PADDING)
  renderAbilities = (abilities: OptionDefinition[], selections: ObjSet) => this.renderOptions(SelectionType.Ability, abilities, selections, 2, this.onGeneralItemClick, false, PERCENT_PADDING)

  renderOptions = (type: SelectionType, options: OptionDefinition[], selections: ObjSet, columns: number, onClick: (enabled: boolean) => ((type: SelectionType, key: string) => void), disabled: boolean, padding?: string) => {


    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            options.map((option, index) => (
              <Table.Row key={index}>
                {
                  option.map(item => {
                    const key = item.key
                    return this.renderCell2(type, key, item.name, selections && selections[key], item.modifiers, onClick, padding, disabled)
                  })
                }
                {
                  mapRange(columns - option.length, (value) => <Table.Cell key={value} />)
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  renderTechLevel = (level: number, enabled: boolean, modifiers: Modifier[]) => (
    <Table.Cell
      key={level}
      positive={enabled}
      selectable
      onClick={enabled ? () => this.clearTech(level) : () => this.enableTech(level)}
    >
      {this.renderModifiers(null, modifiers, PERCENT_PADDING)}
    </Table.Cell>
  )

  clearGeneralSelection = (type: SelectionType, key: string) => {
    const { clearGeneralSelection } = this.props
    this.exec(clearGeneralSelection, type, key)
  }

  findOptionKeys = (options: OptionDefinition[], key: string) => options.find(policy => policy.find(option => option.key === key))?.map(option => option.key)

  enableGeneralSelection = (type: SelectionType, key: string) => {
    const { enableGeneralSelection, clearGeneralSelections } = this.props
    if (type === SelectionType.Ability) {
      const keys = this.findOptionKeys(abilities_ir, key)
      if (keys)
        this.exec(clearGeneralSelections, type, keys)
    }
    this.exec(enableGeneralSelection, type, key)
  }

  onGeneralItemClick = (enabled: boolean) => enabled ? this.clearGeneralSelection : this.enableGeneralSelection

  clearCountrySelection = (type: SelectionType, key: string) => {
    const { clearCountrySelection } = this.props
    this.exec(clearCountrySelection, type, key)
  }

  enableCountrySelection = (type: SelectionType, key: string) => {
    const { enableCountrySelection, clearCountrySelections } = this.props
    if (type === SelectionType.Heritage)
      this.exec(clearCountrySelections, type)
    if (type === SelectionType.Policy) {
      const keys = this.findOptionKeys(policies_ir, key)
      if (keys)
        this.exec(clearCountrySelections, type, keys)
    }
    this.exec(enableCountrySelection, type, key)
  }


  onCountryItemClick = (enabled: boolean) => enabled ? this.clearCountrySelection : this.enableCountrySelection

  renderCell2 = (type: SelectionType, key: string, name: string | null, enabled: boolean, modifiers: Modifier[], onClick: (enabled: boolean) => ((type: SelectionType, key: string) => void), padding?: string, disabled?: boolean, width?: number) => (
    <Table.Cell
      disabled={disabled}
      key={key}
      positive={enabled}
      selectable
      colSpan={width || 1}
      onClick={() => onClick(enabled)(type, key)}
      style={{ padding: CELL_PADDING }}
    >
      {this.renderModifiers(name, modifiers, padding)}
    </Table.Cell>
  )

  renderCell = (key: string, name: string | null, enabled: boolean, modifiers: Modifier[], enable?: (() => void), clear?: (() => void), padding?: string, disabled?: boolean, width?: number) => (
    <Table.Cell
      disabled={disabled}
      key={key}
      positive={enabled}
      selectable
      colSpan={width || 1}
      onClick={
        enabled
          ? (clear ? clear : () => { })
          : (enable ? enable : () => { })
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

  enableInvention = (key: string, level: number) => {
    const { enableCountrySelection } = this.props
    this.exec(enableCountrySelection, SelectionType.Invention, key)
    this.enableTech(level)
  }

  enableTech = (level: number) => {
    const { country } = this.props
    if (level > country[CountryAttribute.TechLevel])
      this.setCountryValue('Base', CountryAttribute.TechLevel, level)
  }

  clearTech = (level: number) => {
    const { country, clearCountrySelections } = this.props
    const keys = tech_ir.filter((_, index) => level <= index && index <= country[CountryAttribute.TechLevel]).reduce((prev, curr) => prev.concat(curr.inventions.map(value => value.name)), [] as string[])
    this.exec(clearCountrySelections, SelectionType.Invention, keys)
    this.setCountryValue('Base', CountryAttribute.TechLevel, level - 1)
  }

  clearInvention = (key: string) => {
    const { clearCountrySelection } = this.props
    this.exec(clearCountrySelection, SelectionType.Invention, key)
  }

  /** Clears traditions starting from a given tradition. */
  clearTradition = (traditions: ListDefinition[], key: string) => {
    const { enableCountrySelections, clearCountrySelections } = this.props
    this.activateTradition()
    let add = true
    const toAdd: string[] = []
    const toRemove: string[] = []
    traditions.forEach(tradition => {
      if (tradition.key === key)
        add = false
      if (add)
        toAdd.push(tradition.key)
      else
        toRemove.push(tradition.key)
    })
    this.exec(enableCountrySelections, SelectionType.Tradition, toAdd)
    this.exec(clearCountrySelections, SelectionType.Tradition, toRemove)
  }

  /** Enables traditions up to a given tradition. */
  enableTradition = (traditions: ListDefinition[], key: string) => {
    const { enableCountrySelections, clearCountrySelections } = this.props
    this.activateTradition()
    let add = true
    const toAdd: string[] = []
    const toRemove: string[] = []
    traditions.forEach(tradition => {
      if (add)
        toAdd.push(tradition.key)
      else
        toRemove.push(tradition.key)
      if (tradition.key === key)
        add = false
    })
    this.exec(enableCountrySelections, SelectionType.Tradition, toAdd)
    this.exec(clearCountrySelections, SelectionType.Tradition, toRemove)
  }

  activateTradition = () => {
    const { enableCountrySelection } = this.props
    this.exec(enableCountrySelection, SelectionType.Tradition, 'base')
  }

  deactivateTradition = () => {
    const { clearCountrySelections } = this.props
    this.exec(clearCountrySelections, SelectionType.Tradition)
  }

  /**
   * Enables an option and clears any existing options.
   */
  enableOption = (key: string, modifiers: Modifier[], selections: ObjSet) => {
  }

  /**
   * Enables a omen and clears any existing omens.
   */
  enableOmen = (key: string, modifiers: Modifier[], selections: ObjSet) => {
  }

  /**
   * Selects religion while also re-enabling current omen.
   */
  selectReligion = (value: ReligionType) => {
    this.exec(this.props.selectReligion, value)
  }

  selectCulture = (value: CultureType) => {
    this.exec(this.props.selectCulture, value, !this.props.settings[Setting.Culture])
  }

  /** Executes a given function with currently selected country. */
  exec = <T extends any>(func: (country: CountryName, value: T, ...rest: any[]) => void, value: T, ...rest: any[]) => func(this.props.selected_country, value, ...rest)

  /**
   * Scales modifier with a given power.
   */
  scaleModifier = (modifier: Modifier, power: number) => ({ ...modifier, value: modifier.value * power / 100.0 })

  /**
   * Clears all selections.
   */
  clearAll = () => {
    this.exec(this.props.clearAllCountrySelections, 0)
    this.exec(this.props.clearAllGeneralSelections, 0)
    this.exec(this.props.clearCountryValues, 'Base')
    this.exec(this.props.setHasGeneral, true)
    this.exec(this.props.setGeneralStat, GeneralAttribute.Martial, 0)
  }

  /**
   * Sets generals martial skill level.
   */
  setGeneralMartial = (value: string) => {
    const skill = Number(value)
    if (isNaN(skill))
      return
    this.props.setGeneralStat(this.props.selected_country, GeneralAttribute.Martial, skill)
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
  trades: state.data.trades,
  omens: state.data.omens,
  country_definition: state.countries[state.settings.country],
  country: convertCountryDefinition(state.countries[state.settings.country], state.settings.siteSettings),
  selected_country: state.settings.country,
  general_definition: getGeneralDefinition(state, state.settings.country),
  general: getGeneral(state, state.settings.country),
  settings: getSiteSettings(state)
})

const actions = {
  clearGeneralSelections, setGeneralStat, setGeneralValue, selectCulture, setCountryValue, clearAllGeneralSelections, clearGeneralSelection, enableGeneralSelection,
  clearCountryValues, clearAllCountrySelections, selectReligion, selectGovernment, setHasGeneral, enableCountrySelection, clearCountrySelection, enableCountrySelections, clearCountrySelections
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Countries)
