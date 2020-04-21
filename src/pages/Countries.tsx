import React, { Component } from 'react'
import { Container, Grid, Table, List, Input, Checkbox } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, getGeneral, getGeneralDefinition, getSiteSettings } from 'state'
import { mapRange, ObjSet, keys, values } from '../utils'

import { addSignWithZero } from 'formatters'
import {
  ValuesType, TraditionDefinition, TradeDefinition, IdeaDefinition, HeritageDefinition, InventionDefinition, OmenDefinition, TraitDefinition, EconomyDefinition, LawDefinition,
  AbilityDefinition, Modifier, Tradition, UnitAttribute, ReligionType, CultureType, ModifierType, CountryAttribute, GeneralAttribute, CombatPhase, GeneralValueType, filterAttributes, CountryName, Setting
} from 'types'
import {
  clearCountryValues, clearAllCountrySelections, setCountryValue, enableCountrySelections, enableCountrySelection, clearCountrySelections, clearCountrySelection, enableUnitModifiers,
  clearUnitModifiers, setGeneralStat, setGeneralValue, selectCulture, selectReligion, selectGovernment, setHasGeneral,
  clearAllGeneralSelections, clearGeneralSelection, enableGeneralSelection, clearGeneralSelections
} from 'reducers'

import AccordionToggle from 'containers/AccordionToggle'
import CountryManager from 'containers/CountryManager'
import Dropdown from 'components/Dropdowns/Dropdown'
import ConfirmationButton from 'components/ConfirmationButton'
import StyledNumber from 'components/Utils/StyledNumber'
import TableAttributes from 'components/TableAttributes'
import { mapModifiersToUnits, tech_ir, TRAIT_KEY, ABILITY_KEY, abilities_ir, traits_ir, heritages_ir } from 'managers/modifiers'
import { convertCountryDefinition } from 'managers/countries'
import CountryValueInput from 'containers/CountryValueInput'
import { has } from 'lodash'

const TRADE_COLUMNS = 4
const HERITAGE_COLUMNS = 4
const OMEN_COLUMNS = 4
const TRAIT_COLUMNS = 4
const IDEA_COLUMNS = 3

const TRADE_KEY = 'Trade_'
const TRADITION_KEY = 'Tradition_'
const TRADITION_BASE_KEY = TRADITION_KEY + 'Base'
const HERITAGE_KEY = 'Heritage_'
const OMEN_KEY = 'Omen_'
const ECONOMY_KEY = 'Economy_'
const LAW_KEY = 'Law_'
const IDEA_KEY = 'Idea_'
const NO_GENERAL_KEY = 'No general'

const CELL_PADDING = '.78571429em .78571429em'

class Countries extends Component<IProps> {

  render() {
    const { settings, general_definition, general, inventions, trades, selected_country,
      traditions, omens, traits, abilities, heritages, economy, ideas, laws, country_definition, country } = this.props
    const selections = country_definition.selections
    const tradition = traditions[country.culture]
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
                values={keys(traditions)}
                value={country.culture}
                onChange={item => this.selectCulture(item, selections)}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                values={keys(omens)}
                value={country.religion}
                onChange={item => this.selectReligion(item, country[CountryAttribute.OmenPower], selections)}
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
                Base martial: <Input disabled={!general.enabled} type='number' value={general.base_values[GeneralAttribute.Martial]} onChange={(_, { value }) => this.setGeneralMartial(value)} />
                {' '}with <StyledNumber value={general.extra_values[GeneralAttribute.Martial]} formatter={addSignWithZero} /> from traits
                {
                  this.renderTraits(traits, general.selections, !general.enabled)
                }
                {
                  this.renderAbilities(abilities, general.selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title={'Traditions (' + country.culture + ')'} identifier='countries_tradition'>
                Military experience: <CountryValueInput attribute={CountryAttribute.MilitaryExperience} country={selected_country} />
                {
                  this.renderTraditions(tradition, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Trade' identifier='countries_trade'>
                {
                  this.renderTrades(trades, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Technology & Inventions' identifier='countries_invention'>
                {
                  this.renderInventions(inventions, country[CountryAttribute.TechLevel], selections)
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
                  this.renderOmens(omen, selections, country[CountryAttribute.OmenPower])
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
                        Republic Global Discipline (0 - 7.5): <CountryValueInput attribute={CountryAttribute.OfficeDiscipline} country={selected_country} />
                      </Table.Cell>
                      <Table.Cell>
                        Monarch Land Morale (0 - 15): <CountryValueInput attribute={CountryAttribute.OfficeMorale} country={selected_country} />>
                      </Table.Cell>
                      <Table.Cell />
                    </Table.Row>
                  </Table.Body>
                </Table>
                {
                  this.renderLaws(laws, selections)
                }
                {
                  this.renderEconomy(economy, selections)
                }
                {
                  this.renderIdeas(ideas, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Heritage' identifier='countries_heritage'>
                {
                  this.renderHeritages(heritages, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Attributes' identifier='countries_attributes'>
                <TableAttributes attributes={filterAttributes(values(CountryAttribute), settings)} custom_value_key='Custom' definition={country_definition} onChange={this.setCountryValue} />
                <TableAttributes attributes={filterAttributes((values(GeneralAttribute) as GeneralValueType[]).concat(values(CombatPhase)), settings)} custom_value_key='Custom' definition={general_definition} onChange={this.setGeneralValue} />
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
              this.renderCell(TRADITION_BASE_KEY, null, selections[TRADITION_BASE_KEY], traditions.modifiers,
                undefined, () => this.clearModifiersStartingWith(TRADITION_KEY, selections), undefined, undefined, 3)
            }
          </Table.Row>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  traditions.paths.map((path, column) => {
                    const tradition = path.traditions[row]
                    if (!tradition)
                      return null
                    const key = TRADITION_KEY + column + '_' + row
                    const modifiers = tradition.modifiers
                    return this.renderCell(key, null, selections[key], modifiers,
                      () => this.enableTradition(path.traditions, traditions.modifiers, column, row, selections), () => this.enableTradition(path.traditions, traditions.modifiers, column, row - 1, selections))
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
    )
  }

  renderTrades = (trades: TradeDefinition[], selections: ObjSet) => {
    const rows = Math.ceil(trades.length / TRADE_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(TRADE_COLUMNS, number => number).map(column => {
                    const index = row * TRADE_COLUMNS + column
                    const trade = trades[index]
                    if (!trade)
                      return (<Table.Cell key={TRADE_KEY + index}></Table.Cell>)
                    const key = TRADE_KEY + trade.type + '_' + trade.name
                    const modifiers = [trade.modifier]
                    return this.renderCell(key, trade.type + ': ' + trade.name, selections[key], modifiers)
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  renderIdeas = (ideas: IdeaDefinition[], selections: ObjSet) => {
    const rows = Math.ceil(ideas.length / IDEA_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(IDEA_COLUMNS, number => number).map(column => {
                    const index = row * IDEA_COLUMNS + column
                    const idea = ideas[index]
                    if (!idea)
                      return (<Table.Cell key={IDEA_KEY + index}></Table.Cell>)
                    const key = IDEA_KEY + index
                    const modifiers = idea.modifiers
                    return this.renderCell(key, idea.name, selections[key], modifiers)
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  renderInventions = (inventions: InventionDefinition[], tech: number, selections: ObjSet) => {
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
                    const key = invention.name
                    return this.renderCell(key, null, selections[key] && row <= tech, invention.modifiers,
                      () => this.enableInvention(key, row), () => this.clearInvention(key))
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
                    return this.renderCell(key, omen.name, selections[key], modifiers, () => this.enableOmen(key, modifiers, selections))
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }


  renderTraits = (traits: TraitDefinition[], selections: ObjSet, disabled: boolean) => this.renderList(traits, selections, TRAIT_COLUMNS, TRAIT_KEY, this.onGeneralItemClick, disabled)
  renderHeritages = (heritages: HeritageDefinition[], selections: ObjSet) => this.renderList(heritages, selections, HERITAGE_COLUMNS, '', this.onCountryItemClick, false, '\u00a0\u00a0\u00a0\u00a0')


  renderList = (entities: { name: string, key: string, modifiers: Modifier[] }[], selections: ObjSet, columns: number, parent_key: string, onClick: (enabled: boolean) => ((key: string) => void), disabled: boolean, padding?: string) => {
    entities = entities.filter(entity => entity.modifiers.length)
    const rows = Math.ceil(entities.length / columns)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(columns, number => number).map(column => {
                    const index = row * columns + column
                    const entity = entities[index]
                    if (!entity)
                      return (<Table.Cell key={TRAIT_KEY + index}></Table.Cell>)
                    const modifiers = entity.modifiers
                    const key = parent_key + entity.key
                    return this.renderCell2(key, entity.name, selections[key], modifiers, onClick, padding, disabled)
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }
  renderEconomy = (economy: EconomyDefinition[], selections: ObjSet) => this.renderOptions(ECONOMY_KEY, economy, selections, 2)

  renderLaws = (laws: LawDefinition[], selections: ObjSet) => this.renderOptions(LAW_KEY, laws, selections, 4)

  renderAbilities = (abilities: AbilityDefinition[], selections: ObjSet) => {
    const modifier_key = ABILITY_KEY
    const definitions = abilities
    const columns = 2

    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            definitions.map(options => (
              <Table.Row key={options.name}>
                {
                  options.options.map(option => {
                    const key = modifier_key + option.key
                    const modifiers = option.modifiers
                    return this.renderCell2(key, option.name, selections[key], modifiers, this.onGeneralItemClick)
                  })
                }
                {
                  mapRange(columns - options.options.length, (value) => <Table.Cell key={value} />)
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  renderOptions = (modifier_key: string, definitions: (EconomyDefinition | LawDefinition)[], selections: ObjSet, columns: number) => {
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            definitions.map(options => (
              <Table.Row key={options.name}>
                {
                  options.options.map(option => {
                    const key = modifier_key + options.name + '_' + option.name
                    const modifiers = option.modifiers
                    return this.renderCell(key, option.name, selections[key], modifiers,
                      () => this.enableOption(key, modifiers, selections), () => this.clearModifiers(key))
                  })
                }
                {
                  mapRange(columns - options.options.length, (value) => <Table.Cell key={value} />)
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
      {this.renderModifiers(null, modifiers)}
    </Table.Cell>
  )

  clearGeneralSelection = (key: string) => {
    const { clearGeneralSelection } = this.props
    this.exec(clearGeneralSelection, key)
  }

  enableGeneralSelection = (key: string) => {
    const { enableGeneralSelection, abilities, clearGeneralSelections } = this.props
    abilities.forEach(abilities => {
      const keys = abilities.options.map(ability => ABILITY_KEY + ability.key)
      if (keys.includes(key))
        this.exec(clearGeneralSelections, keys)
    })
    this.exec(enableGeneralSelection, key)
  }

  onGeneralItemClick = (enabled: boolean) => enabled ? this.clearGeneralSelection : this.enableGeneralSelection

  clearCountrySelection = (key: string) => {
    const { clearCountrySelection } = this.props
    this.exec(clearCountrySelection, key)
  }

  enableCountrySelection = (key: string) => {
    const { enableCountrySelection, heritages, clearCountrySelections } = this.props
    const keys = heritages.map(heritage => heritage.key)
    this.exec(clearCountrySelections, keys)
    this.exec(enableCountrySelection, key)
  }


  onCountryItemClick = (enabled: boolean) => enabled ? this.clearCountrySelection : this.enableCountrySelection

  renderCell2 = (key: string, name: string | null, enabled: boolean, modifiers: Modifier[], onClick: (enabled: boolean) => ((key: string) => void), padding?: string, disabled?: boolean, width?: number) => (
    <Table.Cell
      disabled={disabled}
      key={key}
      positive={enabled}
      selectable
      colSpan={width || 1}
      onClick={() => onClick(enabled)(key)}
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

  enableInvention = (key: string, level: number) => {
    const { enableCountrySelection: enableSelection } = this.props
    this.exec(enableSelection, key)
    this.enableTech(level)
  }

  enableTech = (level: number) => {
    const { country } = this.props
    console.log(country[CountryAttribute.TechLevel])
    if (level > country[CountryAttribute.TechLevel])
      this.setCountryValue('Custom', CountryAttribute.TechLevel, level)
  }

  clearTech = (level: number) => {
    const { country, inventions, clearCountrySelections: clearSelections } = this.props
    const keys = inventions.filter((_, index) => level <= index && index <= country[CountryAttribute.TechLevel]).reduce((prev, curr) => prev.concat(curr.inventions.map(value => value.name)), [] as string[])
    this.exec(clearSelections, keys)
    this.setCountryValue('Custom', CountryAttribute.TechLevel, level - 1)
  }

  clearInvention = (key: string) => {
    const { clearCountrySelection: clearSelection } = this.props
    this.exec(clearSelection, key)
  }

  /**
   * Clears traditions from a given column above a given row.
   */
  clearTraditions = (column: number, row: number, selections: ObjSet) => {
    const key = TRADITION_KEY + column
    keys(selections).filter(value => value.startsWith(key) && !value.startsWith(TRADITION_BASE_KEY) && this.getNumberFromKey(value, 2) > row)
      .forEach(value => this.clearModifiers(value))
  }

  /**
   * Enables traditions from a given column up to a given row.
   */
  enableTraditions = (traditions: Tradition[], column: number, row: number, selections: ObjSet) => {
    mapRange(row + 1, number => number).filter(value => !has(selections, TRADITION_KEY + column + '_' + value))
      .forEach(value => this.enableModifiers(TRADITION_KEY + column + '_' + value, traditions[value].modifiers))
  }

  /**
   * Enables a tradition and enables traditions before it.
   */
  enableTradition = (traditions: Tradition[], base: Modifier[], column: number, row: number, selections: ObjSet) => {
    this.clearTraditions(column, row, selections)
    if (!has(selections, TRADITION_BASE_KEY))
      this.enableModifiers(TRADITION_BASE_KEY, base)
    this.enableTraditions(traditions, column, row, selections)
  }

  /**
   * Enables a heritage and clears any existing heritages.
   */
  enableHeritage = (key: string, modifiers: Modifier[], selections: ObjSet) => {
    this.clearModifiersStartingWith(HERITAGE_KEY, selections)
    this.enableModifiers(key, modifiers)
  }

  /**
   * Clears modifiers starting with a given key.
   */
  clearModifiersStartingWith = (key: string, selections: ObjSet) => {
    Object.keys(selections).filter(value => value.startsWith(key)).forEach(value => this.clearModifiers(value))
  }

  /**
   * Enables an option and clears any existing options.
   */
  enableOption = (key: string, modifiers: Modifier[], selections: ObjSet) => {
    this.clearModifiersStartingWith(this.getUpperKey(key) + '_', selections)
    this.enableModifiers(key, modifiers)
  }

  /**
   * Enables a omen and clears any existing omens.
   */
  enableOmen = (key: string, modifiers: Modifier[], selections: ObjSet) => {
    this.clearModifiersStartingWith(OMEN_KEY, selections)
    this.enableModifiers(key, modifiers)
  }

  /**
   * Refreshes active omens to update their buff.
   */
  refreshOmens = (selections: ObjSet, power: number, omens?: OmenDefinition[]) => {
    if (!omens)
      return
    Object.keys(selections).filter(value => value.startsWith(OMEN_KEY)).forEach(value => {
      const index = this.getNumberFromKey(value, 1)
      const omen = omens[index]
      if (omen)
        this.enableModifiers(value, [this.scaleModifier(omen.modifier, power)])
      else
        this.clearModifiers(value)
    })
  }

  /**
   * Refreshes active traditions to update their buff.
   */
  refreshTraditions = (selections: ObjSet, traditions?: TraditionDefinition) => {
    if (!traditions)
      return
    Object.keys(selections).filter(value => value.startsWith(TRADITION_KEY) && !value.startsWith(TRADITION_BASE_KEY)).forEach(value => {
      this.clearModifiers(value)
      const column = this.getNumberFromKey(value, 1)
      const path = traditions.paths[column]
      if (!path)
        return
      const row = this.getNumberFromKey(value, 2)
      const tradition = path.traditions[row]
      if (!tradition)
        return
      this.enableModifiers(value, tradition.modifiers)
    })
    if (selections.hasOwnProperty(TRADITION_BASE_KEY))
      this.enableModifiers(TRADITION_BASE_KEY, traditions.modifiers)
  }

  /**
   * Selects religion while also re-enabling current omen.
   */
  selectReligion = (value: ReligionType, power: number, selections: ObjSet) => {
    this.exec(this.props.selectReligion, value)
    const omens = this.props.omens[value]
    this.refreshOmens(selections, power, omens)
  }

  /**
   * Selects culture while also re-enabling tradition.
   */
  selectCulture = (value: CultureType, selections: ObjSet) => {
    this.exec(this.props.selectCulture, value, !this.props.settings[Setting.Culture])
    this.refreshTraditions(selections, this.props.traditions[value])
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
    this.exec(this.props.clearCountryValues, 'Custom')
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

  enableModifiers = (key: string, modifiers: Modifier[]) => {
    const { enableUnitModifiers, enableCountrySelection, clearGeneralSelection, selected_country } = this.props
    modifiers = mapModifiersToUnits(modifiers)
    enableUnitModifiers(selected_country, key, modifiers)
    this.exec(enableCountrySelection, key)
    this.exec(clearGeneralSelection, key)
  }

  clearModifiers = (key: string) => {
    const { clearUnitModifiers, clearCountrySelection, clearGeneralSelection } = this.props
    this.exec(clearUnitModifiers, key)
    this.exec(clearCountrySelection, key)
    this.exec(clearGeneralSelection, key)
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
  traditions: state.data.traditions,
  trades: state.data.trades,
  heritages: heritages_ir,
  inventions: tech_ir,
  omens: state.data.omens,
  country_definition: state.countries[state.settings.country],
  country: convertCountryDefinition(state.countries[state.settings.country], state.settings.siteSettings),
  selected_country: state.settings.country,
  laws: state.data.laws,
  economy: state.data.economy,
  traits: traits_ir,
  ideas: state.data.ideas,
  abilities: abilities_ir,
  general_definition: getGeneralDefinition(state, state.settings.country),
  general: getGeneral(state, state.settings.country),
  settings: getSiteSettings(state)
})

const actions = {
  clearGeneralSelections, clearUnitModifiers, enableUnitModifiers, setGeneralStat, setGeneralValue, selectCulture, setCountryValue, clearAllGeneralSelections, clearGeneralSelection, enableGeneralSelection,
  clearCountryValues, clearAllCountrySelections, selectReligion, selectGovernment, setHasGeneral, enableCountrySelection, clearCountrySelection, enableCountrySelections, clearCountrySelections
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Countries)
