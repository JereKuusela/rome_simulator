import React, { Component } from 'react'
import { Container, Grid, Table, List, Input, Checkbox, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, getGeneral, getGeneralDefinition, getSiteSettings, getSelectedArmy } from 'state'
import { mapRange, ObjSet, values } from '../utils'

import { addSignWithZero } from 'formatters'
import {
  TraditionDefinition, TradeDefinition, ListDefinition,
  OptionDefinition, Modifier, ReligionType, CultureType, ModifierType, CountryAttribute, GeneralAttribute, CombatPhase, GeneralValueType, filterAttributes, CountryName, Setting, SelectionType, TechDefinition, ArmyName, DeityDefinition
} from 'types'
import {
  clearCountryAttributes, setCountryAttribute, enableCountrySelections, enableCountrySelection, clearCountrySelections, clearCountrySelection,
  setGeneralAttribute, selectCulture, selectReligion, selectGovernment, setHasGeneral, clearGeneralAttributes,
  clearGeneralSelection, enableGeneralSelection, clearGeneralSelections
} from 'reducers'

import AccordionToggle from 'containers/AccordionToggle'
import CountryManager from 'containers/CountryManager'
import Dropdown from 'components/Dropdowns/Dropdown'
import StyledNumber from 'components/Utils/StyledNumber'
import TableAttributes from 'components/TableAttributes'
import { tech_ir, abilities_ir, traits_ir, heritages_ir, traditions_ir, ideas_ir, policies_ir, laws_ir, trades_ir, deities_ir } from 'managers/modifiers'
import { convertCountryDefinition } from 'managers/countries'
import CountryValueInput from 'containers/CountryValueInput'

const PERCENT_PADDING = '\u00a0\u00a0\u00a0\u00a0'

const CELL_PADDING = '.78571429em .78571429em'

class Countries extends Component<IProps> {

  render() {
    const { settings, generalDefinition, general, selectedCountry, setHasGeneral,
      countryDefinition, country } = this.props
    const countrySelections = countryDefinition.selections
    const tradition = traditions_ir[country.culture]
    return (
      <Container>
        <CountryManager>
          <Button negative onClick={this.clearAll}>Clear selections</Button>
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
                Base martial: <Input disabled={!general.enabled} type='number' value={general.base_values[GeneralAttribute.Martial]} onChange={(_, { value }) => this.setGeneralValue('Base', GeneralAttribute.Martial, Number(value))} />
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
                Military experience: <CountryValueInput attribute={CountryAttribute.MilitaryExperience} country={selectedCountry} />
                {
                  this.renderTraditions(tradition, countrySelections[SelectionType.Tradition])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Trade' identifier='countries_trade'>
                {
                  this.renderTrades(trades_ir, countrySelections[SelectionType.Trade])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Technology & Inventions' identifier='countries_invention'>
                {
                  this.renderInventions(tech_ir, country[CountryAttribute.TechLevel], countrySelections[SelectionType.Invention])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title={'Deities'} identifier='countries_deities'>
                Omen power: <CountryValueInput attribute={CountryAttribute.OmenPower} country={selectedCountry} />
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
                  this.renderDeities(deities_ir, countrySelections[SelectionType.Deity], country[CountryAttribute.OmenPower])
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
                        Republic Discipline (0 - 7.5): <CountryValueInput attribute={CountryAttribute.OfficeDiscipline} country={selectedCountry} />
                      </Table.Cell>
                      <Table.Cell>
                        Monarch Land Morale (0 - 15): <CountryValueInput attribute={CountryAttribute.OfficeMorale} country={selectedCountry} />
                      </Table.Cell>
                      <Table.Cell />
                    </Table.Row>
                  </Table.Body>
                </Table>
                {
                  this.renderLaws(laws_ir, countrySelections[SelectionType.Law])
                }
                {
                  this.renderPolicies(policies_ir, countrySelections[SelectionType.Policy])
                }
                {
                  this.renderIdeas(ideas_ir, countrySelections[SelectionType.Idea])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Heritage' identifier='countries_heritage'>
                {
                  this.renderHeritages(heritages_ir, countrySelections[SelectionType.Heritage])
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Attributes' identifier='countries_attributes'>
                <TableAttributes attributes={filterAttributes(values(CountryAttribute), settings)} custom_value_key='Custom' definition={countryDefinition} onChange={this.setCountryValue} />
                <TableAttributes attributes={filterAttributes((values(GeneralAttribute) as GeneralValueType[]).concat(values(CombatPhase)), settings)} custom_value_key='Custom' definition={generalDefinition} onChange={this.setGeneralValue} />
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

  renderDeities = (omens: DeityDefinition[], selections: ObjSet, power: number) => {
    const rows = Math.ceil(omens.length / 4)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(4, number => number).map(column => {
                    const index = row * 4 + column
                    const entity = omens[index]
                    if (!entity)
                      return (<Table.Cell key={index}></Table.Cell>)
                    const key = entity.key
                    const modifiers = entity.isOmen ? entity.modifiers.map(modifier => ({...modifier, value: modifier.value * power / 100})) : entity.modifiers
                    return this.renderCell2(SelectionType.Deity, key, entity.name, selections && selections[key], modifiers, this.onCountryItemClick, PERCENT_PADDING)
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
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
      </Table>
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
    this.execArmy(clearGeneralSelection, type, key)
  }

  findOptionKeys = (options: OptionDefinition[], key: string) => options.find(policy => policy.find(option => option.key === key))?.map(option => option.key)

  enableGeneralSelection = (type: SelectionType, key: string) => {
    const { enableGeneralSelection, clearGeneralSelections } = this.props
    if (type === SelectionType.Ability) {
      const keys = this.findOptionKeys(abilities_ir, key)
      if (keys)
        this.execArmy(clearGeneralSelections, type, keys)
    }
    this.execArmy(enableGeneralSelection, type, key)
  }

  onGeneralItemClick = (enabled: boolean) => enabled ? this.clearGeneralSelection : this.enableGeneralSelection

  clearCountrySelection = (type: SelectionType, key: string) => {
    const { clearCountrySelection } = this.props
    this.execCountry(clearCountrySelection, type, key)
  }

  enableCountrySelection = (type: SelectionType, key: string) => {
    const { enableCountrySelection, clearCountrySelections } = this.props
    if (type === SelectionType.Heritage)
      this.execCountry(clearCountrySelections, type)
    if (type === SelectionType.Policy) {
      const keys = this.findOptionKeys(policies_ir, key)
      if (keys)
        this.execCountry(clearCountrySelections, type, keys)
    }
    this.execCountry(enableCountrySelection, type, key)
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
    this.execCountry(enableCountrySelection, SelectionType.Invention, key)
    this.enableTech(level)
  }

  enableTech = (level: number) => {
    const { country } = this.props
    if (level > country[CountryAttribute.TechLevel])
      this.setCountryValue('', CountryAttribute.TechLevel, level)
  }

  clearTech = (level: number) => {
    const { country, clearCountrySelections } = this.props
    const keys = tech_ir.filter((_, index) => level <= index && index <= country[CountryAttribute.TechLevel]).reduce((prev, curr) => prev.concat(curr.inventions.map(value => value.name)), [] as string[])
    this.execCountry(clearCountrySelections, SelectionType.Invention, keys)
    this.setCountryValue('', CountryAttribute.TechLevel, level - 1)
  }

  clearInvention = (key: string) => {
    const { clearCountrySelection } = this.props
    this.execCountry(clearCountrySelection, SelectionType.Invention, key)
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
    this.execCountry(enableCountrySelections, SelectionType.Tradition, toAdd)
    this.execCountry(clearCountrySelections, SelectionType.Tradition, toRemove)
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
    this.execCountry(enableCountrySelections, SelectionType.Tradition, toAdd)
    this.execCountry(clearCountrySelections, SelectionType.Tradition, toRemove)
  }

  activateTradition = () => {
    const { enableCountrySelection } = this.props
    this.execCountry(enableCountrySelection, SelectionType.Tradition, 'base')
  }

  deactivateTradition = () => {
    const { clearCountrySelections } = this.props
    this.execCountry(clearCountrySelections, SelectionType.Tradition)
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
    this.execCountry(this.props.selectReligion, value)
  }

  selectCulture = (value: CultureType) => {
    this.execCountry(this.props.selectCulture, value, !this.props.settings[Setting.Culture])
  }

  /** Executes a given function with currently selected country. */
  execCountry = <T extends any>(func: (country: CountryName, value: T, ...rest: any[]) => void, value: T, ...rest: any[]) => func(this.props.selectedCountry, value, ...rest)
  execArmy = <T extends any>(func: (country: CountryName, army: ArmyName, value: T, ...rest: any[]) => void, value: T, ...rest: any[]) => func(this.props.selectedCountry, this.props.selectedArmy, value, ...rest)

  /**
   * Scales modifier with a given power.
   */
  scaleModifier = (modifier: Modifier, power: number) => ({ ...modifier, value: modifier.value * power / 100.0 })

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

  setCountryValue = (_: string, attribute: CountryAttribute, value: number) => this.execCountry(this.props.setCountryAttribute, attribute, value)

  setGeneralValue = (_: string, attribute: GeneralValueType, value: number) => this.execArmy(this.props.setGeneralAttribute, attribute, value)
}

const mapStateToProps = (state: AppState) => {
  const selectedArmy = getSelectedArmy(state)
  return {
    countryDefinition: state.countries[state.settings.country],
    country: convertCountryDefinition(state.countries[state.settings.country], state.settings.siteSettings),
    selectedCountry: state.settings.country,
    selectedArmy,
    generalDefinition: getGeneralDefinition(state, state.settings.country, selectedArmy),
    general: getGeneral(state, state.settings.country, selectedArmy),
    settings: getSiteSettings(state)
  }
}

const actions = {
  clearGeneralSelections, setGeneralAttribute, selectCulture, setCountryAttribute, clearGeneralSelection, enableGeneralSelection,
  clearCountryAttributes, clearGeneralAttributes, selectReligion, selectGovernment, setHasGeneral, enableCountrySelection, clearCountrySelection, enableCountrySelections, clearCountrySelections
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Countries)
