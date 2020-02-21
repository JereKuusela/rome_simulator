import React, { Component } from 'react'
import { Container, Grid, Table, List, Input, Checkbox } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState, getGeneral, getSettings } from 'state'
import { mapRange, ObjSet, has, keys, values } from '../utils'

import { addSignWithZero } from 'formatters'
import { ValuesType, TraditionDefinition, TradeDefinition, IdeaDefinition, HeritageDefinition, InventionDefinition, OmenDefinition, TraitDefinition, EconomyDefinition, LawDefinition, AbilityDefinition, Modifier, Tradition, ScopeType, UnitAttribute, ReligionType, CultureType, ModifierType, CountryAttribute, UnitType, Mode, GeneralAttribute, CombatPhase, GeneralValueType, filterAttributes } from 'types'
import { invalidate, setCountryValue, enableSelection, clearSelection, enableUnitModifiers, enableGeneralModifiers, clearUnitModifiers, clearGeneralModifiers, setGeneralMartial, setGeneralValue, selectCulture, selectReligion, selectGovernment, setOmenPower, setHasGeneral, setMilitaryPower, setOfficeMorale, setOfficeDiscipline } from 'reducers'

import AccordionToggle from 'containers/AccordionToggle'
import CountryManager from 'containers/CountryManager'
import Dropdown from 'components/Utils/Dropdown'
import ConfirmationButton from 'components/ConfirmationButton'
import StyledNumber from 'components/Utils/StyledNumber'
import TableAttributes from 'components/TableAttributes'
import { getBaseUnitType } from 'managers/units'
import { getGeneralStats } from 'managers/army'

const TRADE_COLUMNS = 4
const HERITAGE_COLUMNS = 4
const OMEN_COLUMNS = 4
const TRAIT_COLUMNS = 4
const IDEA_COLUMNS = 3

const TRAIT_KEY = 'Trait_'
const TRADE_KEY = 'Trade_'
const TRADITION_KEY = 'Tradition_'
const TRADITION_BASE_KEY = TRADITION_KEY + 'Base'
const HERITAGE_KEY = 'Heritage_'
const OMEN_KEY = 'Omen_'
const INVENTION_KEY = 'Invention_'
const ECONOMY_KEY = 'Economy_'
const LAW_KEY = 'Law_'
const IDEA_KEY = 'Idea_'
const ABILITY_KEY = 'Ability_'
const NO_GENERAL_KEY = 'No general'
const MILITARY_POWER_KEY = 'Military power'
const OFFICE_KEY = 'Office_'

const KEYS = [TRAIT_KEY, TRADE_KEY, TRADITION_KEY, HERITAGE_KEY, OMEN_KEY, INVENTION_KEY, ECONOMY_KEY, LAW_KEY, IDEA_KEY, MILITARY_POWER_KEY, NO_GENERAL_KEY, ABILITY_KEY, OFFICE_KEY]

const CELL_PADDING = '.78571429em .78571429em'

class Countries extends Component<IProps> {

  render() {
    const { settings } = this.props
    const country = this.props.countries[this.props.selected_country]
    const selections = country.selections
    const tradition = this.props.traditions[country.culture]
    const omen = this.props.omens[country.religion]
    const general = this.props.general
    const stats = getGeneralStats(general)
    return (
      <Container>
        <CountryManager>
          <ConfirmationButton
            message={'Are you sure you want to clear all selections from country ' + this.props.selected_country + '?'}
            negative
            text='Clear selections'
            onConfirm={() => this.clearAll(selections)} />
        </CountryManager>
        <Grid>
          <Grid.Row columns='3'>
            <Grid.Column>
              <Dropdown
                values={keys(this.props.traditions)}
                value={country.culture}
                onChange={item => this.selectCulture(item, selections)}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                values={keys(this.props.omens)}
                value={country.religion}
                onChange={item => this.selectReligion(item, country.omen_power, selections)}
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
                Base martial: <Input disabled={!general.enabled} type='number' value={stats.base_martial} onChange={(_, { value }) => omen && this.setGeneralMartial(value)} />
                {' '}with <StyledNumber value={stats.trait_martial} formatter={addSignWithZero} /> from traits
                {
                  this.renderTraits(this.props.traits, selections, !general.enabled)
                }
                {
                  this.renderAbilities(this.props.abilities, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title={'Traditions (' + country.culture + ')'} identifier='countries_tradition'>
                Military experience: <Input type='number' value={country.military_power} onChange={(_, { value }) => this.setMilitaryPower(value)} />
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
                  this.renderTrades(this.props.trades, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Technology & Inventions' identifier='countries_invention'>
                {
                  this.renderInventions(this.props.inventions, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title={'Omens (' + country.religion + ')'} identifier='countries_omen'>
                Omen power: <Input type='number' value={country.omen_power} onChange={(_, { value }) => omen && this.setOmenPower(value, selections, omen)} />
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
                  this.renderOmens(omen, selections, country.omen_power)
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
                        Republic Global Discipline (0 - 7.5): <Input size='mini' type='number' value={country.office_discipline} onChange={(_, { value }) => this.setOfficeDiscipline(value)} />
                      </Table.Cell>
                      <Table.Cell>
                        Monarch Land Morale (0 - 15): <Input size='mini' type='number' value={country.office_morale} onChange={(_, { value }) => this.setOfficeMorale(value)} />
                      </Table.Cell>
                      <Table.Cell />
                    </Table.Row>
                  </Table.Body>
                </Table>
                {
                  this.renderLaws(this.props.laws, selections)
                }
                {
                  this.renderEconomy(this.props.economy, selections)
                }
                {
                  this.renderIdeas(this.props.ideas, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Heritage' identifier='countries_heritage'>
                {
                  this.renderHeritages(this.props.heritages, selections)
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
              this.renderCell(TRADITION_BASE_KEY, null, selections, traditions.modifiers,
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
                    return this.renderCell(key, null, selections, modifiers,
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
                    return this.renderCell(key, trade.type + ': ' + trade.name, selections, modifiers)
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
                    return this.renderCell(key, idea.name, selections, modifiers)
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  renderHeritages = (heritages: HeritageDefinition[], selections: ObjSet) => {
    const rows = Math.ceil(heritages.length / HERITAGE_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(HERITAGE_COLUMNS, number => number).map(column => {
                    const index = row * HERITAGE_COLUMNS + column
                    const heritage = heritages[index]
                    if (!heritage)
                      return (<Table.Cell key={HERITAGE_KEY + index}></Table.Cell>)
                    const modifiers = heritage.modifiers
                    const key = HERITAGE_KEY + heritage.name
                    return this.renderCell(key, heritage.name, selections, modifiers,
                      () => this.enableHeritage(key, modifiers, selections), undefined, '\u00a0\u00a0\u00a0\u00a0')
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  renderInventions = (inventions: InventionDefinition[], selections: ObjSet) => {
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
                    const key = INVENTION_KEY + row + '_' + column
                    return this.renderCell(key, null, selections, invention,
                      () => this.enableInvention(inventions, key, invention, selections), () => this.clearInvention(key, selections))
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
                    return this.renderCell(key, omen.name, selections, modifiers, () => this.enableOmen(key, modifiers, selections))
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }


  renderTraits = (traits: TraitDefinition[], selections: ObjSet, disabled: boolean) => {
    const rows = Math.ceil(traits.length / TRAIT_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(TRAIT_COLUMNS, number => number).map(column => {
                    const index = row * TRAIT_COLUMNS + column
                    const trait = traits[index]
                    if (!trait)
                      return (<Table.Cell key={TRAIT_KEY + index}></Table.Cell>)
                    const modifiers = trait.modifiers
                    const key = TRAIT_KEY + trait.name
                    return this.renderCell(key, trait.name, selections, modifiers, undefined, undefined, undefined, disabled)
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

  renderAbilities = (abilities: AbilityDefinition[], selections: ObjSet) => this.renderOptions(ABILITY_KEY, abilities, selections, 2)

  renderOptions = (modifier_key: string, definitions: (EconomyDefinition | LawDefinition | AbilityDefinition)[], selections: ObjSet, columns: number) => {
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
                    return this.renderCell(key, option.name, selections, modifiers,
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
   * Sets omen power while also re-enabling current omen.
   */
  setOmenPower = (value: string, selections: ObjSet, omens?: OmenDefinition[]) => {
    const power = Number(value)
    if (isNaN(power))
      return
    this.props.setOmenPower(power)
    this.refreshOmens(selections, power, omens)
  }

  /**
   * Sets military power while setting the morale buff.
   */
  setMilitaryPower = (value: string) => {
    const power = Number(value)
    if (isNaN(power))
      return
    this.props.setMilitaryPower(power)
    this.enableModifiers(MILITARY_POWER_KEY, [{
      target: UnitType.BaseLand,
      scope: ScopeType.Country,
      attribute: UnitAttribute.Morale,
      type: ValuesType.Modifier,
      value: power * 0.001
    }])
  }

  /**
   * Sets republic office value while refreshing the discipline buff.
   */
  setOfficeDiscipline = (value: string) => {
    const number = Number(value)
    if (isNaN(number))
      return
    this.props.setOfficeDiscipline(number)
    this.enableModifiers(OFFICE_KEY + 'Discipline', [{
      target: ModifierType.Global,
      type: ValuesType.Base,
      scope: ScopeType.Country,
      attribute: UnitAttribute.Discipline,
      value: number / 100.0
    }])
  }

  /**
   * Sets republic office value while refreshing the morale buff.
   */
  setOfficeMorale = (value: string) => {
    const number = Number(value)
    if (isNaN(number))
      return
    this.props.setOfficeMorale(number)
    this.enableModifiers(OFFICE_KEY + 'Morale', [{
      target: UnitType.BaseLand,
      scope: ScopeType.Country,
      attribute: UnitAttribute.Morale,
      type: ValuesType.Modifier,
      value: number / 100.0
    }])
  }

  /**
   * Selects religion while also re-enabling current omen.
   */
  selectReligion = (value: ReligionType, power: number, selections: ObjSet) => {
    this.props.selectReligion(value)
    const omens = this.props.omens[value]
    this.refreshOmens(selections, power, omens)
  }

  /**
   * Selects culture while also re-enabling tradition.
   */
  selectCulture = (value: CultureType, selections: ObjSet) => {
    this.props.selectCulture(value)
    this.refreshTraditions(selections, this.props.traditions[value])
  }
  /**
   * Scales modifier with a given power.
   */
  scaleModifier = (modifier: Modifier, power: number) => ({ ...modifier, value: modifier.value * power / 100.0 })


  /**
   * Clears inventions above a given tech level.
   */
  clearInventions = (level: number, selections: ObjSet) => {
    Object.keys(selections).filter(value => value.startsWith(INVENTION_KEY) && this.getNumberFromKey(value, 1) >= level)
      .forEach(value => this.clearModifiers(value))
  }

  /**
   * Enables tech levels to allow invention from a given level.
   */
  enableTech = (inventions: InventionDefinition[], level: number, selections: ObjSet) => {
    mapRange(level + 1, number => number).filter(value => !has(selections, INVENTION_KEY + value + '_0'))
      .forEach(value => this.enableModifiers(INVENTION_KEY + value + '_0', inventions[value].inventions[0]))
  }

  /**
   * Enables an invention and all required tech levels for it.
   */
  enableInvention = (inventions: InventionDefinition[], key: string, modifiers: Modifier[], selections: ObjSet) => {
    this.enableTech(inventions, this.getNumberFromKey(key, 1), selections)
    this.enableModifiers(key, modifiers)
  }

  /**
   * Clears all selections.
   */
  clearAll = (selections: ObjSet) => {
    KEYS.forEach(key => this.clearModifiersStartingWith(key, selections))
    this.props.setOmenPower(100)
    this.props.setMilitaryPower(0)
    this.props.setOfficeDiscipline(0)
    this.props.setOfficeMorale(0)
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

  clearInvention = (key: string, selections: ObjSet) => {
    const column = this.getNumberFromKey(key, 2)
    if (column === 0)
      this.clearInventions(this.getNumberFromKey(key, 1), selections)
    this.clearModifiers(key)
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
  traditions: state.data.traditions,
  trades: state.data.trades,
  heritages: state.data.heritages,
  inventions: state.data.inventions,
  omens: state.data.omens,
  countries: state.countries,
  selected_country: state.settings.country,
  laws: state.data.laws,
  economy: state.data.economy,
  traits: state.data.traits,
  ideas: state.data.ideas,
  abilities: state.data.abilities,
  general: getGeneral(state, state.settings.country),
  settings: getSettings(state)
})

const actions = {
  enableGeneralModifiers, clearGeneralModifiers, clearUnitModifiers, enableUnitModifiers, setGeneralMartial, setGeneralValue, selectCulture, invalidate, setCountryValue,
  selectReligion, selectGovernment, setOmenPower, setHasGeneral, setMilitaryPower, setOfficeMorale, setOfficeDiscipline, enableSelection, clearSelection
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

export default connect(mapStateToProps, actions)(Countries)
