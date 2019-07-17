import React, { Component } from 'react'
import { Set, List as ImmutableList } from 'immutable'
import { Container, Grid, Table, List, Input } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { mapRange, toList } from '../utils'
import {
  ModifierType, Modifier, Tradition, CultureType,
  OmenDefinition, TraditionDefinition, TradeDefinition, HeritageDefinition, InventionDefinition,
  GovermentType, ReligionType, TraitDefinition, EconomyDefinition, LawDefinition
} from '../store/data'
import {
  enableModifiers, clearModifiers, CountryName, selectGovernment, selectReligion, selectCulture, setOmenPower, setGeneralMartial, defaultCountry
} from '../store/countries'
import AccordionToggle from '../containers/AccordionToggle'
import CountryManager from '../containers/CountryManager'
import DropdownSelector from '../components/DropdownSelector'
import ConfirmationButton from '../components/ConfirmationButton'

const TRADE_COLUMNS = 4.0
const HERITAGE_COLUMNS = 4.0
const OMEN_COLUMNS = 4.0
const TRAIT_COLUMNS = 4.0

const TRAIT_KEY = 'trait_'
const TRADE_KEY = 'trade_'
const TRADITION_KEY = 'tradition_'
const HERITAGE_KEY = 'heritage_'
const OMEN_KEY = 'omen_'
const INVENTION_KEY = 'invention_'
const ECONOMY_KEY = 'economy_'
const LAW_KEY = 'law_'

const KEYS = [TRAIT_KEY, TRADE_KEY, TRADITION_KEY, HERITAGE_KEY, OMEN_KEY, INVENTION_KEY, ECONOMY_KEY, LAW_KEY]

const CELL_PADDING = '.78571429em .78571429em'

class Countries extends Component<IProps> {

  render(): JSX.Element {
    const country = this.props.countries.get(this.props.selected_country, defaultCountry)
    const selections = country.selections
    const tradition = this.props.traditions.get(country.culture)
    const omen = this.props.omens.get(country.religion)
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
              <DropdownSelector
                items={this.props.traditions.keySeq()}
                active={country.culture}
                onSelect={item => this.selectCulture(item, selections)}
              />
            </Grid.Column>
            <Grid.Column>
              <DropdownSelector
                items={this.props.omens.keySeq()}
                active={country.religion}
                onSelect={item => this.selectReligion(item, country.omen_power, selections)}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title={'Traditions (' + country.culture + ')'} identifier='countries_tradition'>
                {
                  tradition && this.renderTraditions(tradition, selections)
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
              <AccordionToggle title='Heritage' identifier='countries_heritage'>
                {
                  this.renderHeritages(this.props.heritages, selections)
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
                  <List.Item>Laws: -15 / 10</List.Item>
                  <List.Item>Ruler: -5 / 5)</List.Item>
                  <List.Item><b>Total: From -20 to 285</b></List.Item>
                </List>

                {
                  omen && this.renderOmens(omen, selections, country.omen_power)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='General' identifier='countries_traits'>
                General base martial: <Input type='number' value={country.general_martial} onChange={(_, { value }) => omen && this.setGeneralMartial(value)} />
                {
                  this.renderTraits(this.props.traits, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Government & Economy' identifier='countries_government'>
                {
                  this.renderLaws(this.props.laws, selections)
                }
                {
                  this.renderEconomy(this.props.economy, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }

  renderTraditions = (tradition: TraditionDefinition, selections: Set<string>) => {
    const rows = tradition.paths.reduce((max, path) => Math.max(max, path.traditions.size), 0)
    return (
      <Table celled unstackable fixed>
        <Table.Header>
          <Table.Row>
            {
              tradition.paths.map(path => (
                <Table.HeaderCell>
                  {path.name}
                </Table.HeaderCell>
              ))
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  tradition.paths.map((path, column) => {
                    const tradition = path.traditions.get(row)
                    if (!tradition)
                      return null
                    const key = TRADITION_KEY + column + '_' + row
                    const modifiers = tradition.modifiers
                    return this.renderCell(key, null, selections, modifiers,
                      () => this.enableTradition(path.traditions, column, row, selections), () => this.enableTradition(path.traditions, column, row - 1, selections))
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
    )
  }

  renderTrades = (trades: ImmutableList<TradeDefinition>, selections: Set<string>) => {
    const rows = Math.ceil(trades.count() / TRADE_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(TRADE_COLUMNS, number => number).map(column => {
                    const index = row * TRADE_COLUMNS + column
                    const trade = trades.get(index)
                    if (!trade)
                      return (<Table.Cell key={TRADE_KEY + index}></Table.Cell>)
                    const key = TRADE_KEY + trade.type + '_' + trade.name
                    const modifiers = toList(trade.modifier)
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

  renderHeritages = (heritages: ImmutableList<HeritageDefinition>, selections: Set<string>) => {
    const rows = Math.ceil(heritages.count() / HERITAGE_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(HERITAGE_COLUMNS, number => number).map(column => {
                    const index = row * HERITAGE_COLUMNS + column
                    const heritage = heritages.get(index)
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

  renderInventions = (inventions: ImmutableList<InventionDefinition>, selections: Set<string>) => {
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

  renderOmens = (omens: ImmutableList<OmenDefinition>, selections: Set<string>, power: number) => {
    const rows = Math.ceil(omens.count() / OMEN_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(OMEN_COLUMNS, number => number).map(column => {
                    const index = row * OMEN_COLUMNS + column
                    const omen = omens.get(index)
                    const key = OMEN_KEY + index
                    if (!omen)
                      return (<Table.Cell key={key}></Table.Cell>)
                    const modifiers = toList({ ...omen.modifier, value: omen.modifier.value * power / 100.0 })
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


  renderTraits = (traits: ImmutableList<TraitDefinition>, selections: Set<string>) => {
    const rows = Math.ceil(traits.count() / TRAIT_COLUMNS)
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(TRAIT_COLUMNS, number => number).map(column => {
                    const index = row * TRAIT_COLUMNS + column
                    const trait = traits.get(index)
                    if (!trait)
                      return (<Table.Cell key={TRAIT_KEY + index}></Table.Cell>)
                    const modifiers = trait.modifiers
                    return this.renderCell(TRAIT_KEY + trait.name, trait.name, selections, modifiers)
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  renderEconomy = (economy: ImmutableList<EconomyDefinition>, selections: Set<string>) => this.renderEconomyOrLaw(ECONOMY_KEY, economy, selections)

  renderLaws = (laws: ImmutableList<LawDefinition>, selections: Set<string>) => this.renderEconomyOrLaw(LAW_KEY, laws, selections)

  renderEconomyOrLaw = (modifier_key: string, economy: ImmutableList<EconomyDefinition | LawDefinition>, selections: Set<string>) => {
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {
            economy.map(options => (
              <Table.Row key={options.name}>
                {
                  options.options.map(option => {
                    const key = modifier_key + options.name + '_' + option.name
                    const modifiers = option.modifiers
                    return this.renderCell(key, option.name, selections, modifiers,
                      () => this.enableOption(key, modifiers, selections), () => this.props.clearModifiers(this.props.selected_country, key))
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table >
    )
  }

  renderCell = (key: string, name: string | null, selections: Set<string>, modifiers: ImmutableList<Modifier>, enable?: (() => void), clear?: (() => void), padding?: string) => (
    <Table.Cell
      key={key}
      positive={selections.has(key)}
      selectable
      onClick={
        selections.has(key)
          ? (clear ? clear : () => this.props.clearModifiers(this.props.selected_country, key))
          : (enable ? enable : () => this.props.enableModifiers(this.props.selected_country, key, modifiers))
      }
      style={{ padding: CELL_PADDING }}
    >
      <List>
        {name &&
          <List.Item>
            <List.Header>
              {name}
            </List.Header>
          </List.Item>
        }
        {
          modifiers.map(modifier => (
            <List.Item>
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
    </Table.Cell>
  )

  /**
   * Clears traditions from a given column above a given row.
   */
  clearTraditions = (column: number, row: number, selections: Set<string>) => {
    const key = TRADITION_KEY + column
    selections.filter(value => value.startsWith(key) && this.getNumberFromKey(value, 2) > row)
      .forEach(value => this.props.clearModifiers(this.props.selected_country, value))
  }

  /**
   * Enables traditions from a given column up to a given row.
   */
  enableTraditions = (traditions: ImmutableList<Tradition>, column: number, row: number, selections: Set<string>) => {
    mapRange(row + 1, number => number).filter(value => !selections.has(TRADITION_KEY + column + '_' + value))
      .forEach(value => this.props.enableModifiers(this.props.selected_country, TRADITION_KEY + column + '_' + value, traditions.get(value)!.modifiers))
  }

  /**
   * Enables a tradition and enables traditions before it.
   */
  enableTradition = (traditions: ImmutableList<Tradition>, column: number, row: number, selections: Set<string>) => {
    this.clearTraditions(column, row, selections)
    this.enableTraditions(traditions, column, row, selections)
  }

  /**
   * Enables a heritage and clears any existing heritages.
   */
  enableHeritage = (key: string, modifiers: ImmutableList<Modifier>, selections: Set<string>) => {
    this.clearModifiers(HERITAGE_KEY, selections)
    this.props.enableModifiers(this.props.selected_country, key, modifiers)
  }

  /**
   * Clears modifiers starting with a given key.
   */
  clearModifiers = (key: string, selections: Set<string>) => {
    selections.filter(value => value.startsWith(key)).forEach(value => this.props.clearModifiers(this.props.selected_country, value))
  }

  /**
   * Enables an option and clears any existing options.
   */
  enableOption = (key: string, modifiers: ImmutableList<Modifier>, selections: Set<string>) => {
    this.clearModifiers(this.getUpperKey(key) + '_', selections)
    this.props.enableModifiers(this.props.selected_country, key, modifiers)
  }

  /**
   * Enables a omen and clears any existing omens.
   */
  enableOmen = (key: string, modifiers: ImmutableList<Modifier>, selections: Set<string>) => {
    this.clearModifiers(OMEN_KEY, selections)
    this.props.enableModifiers(this.props.selected_country, key, modifiers)
  }

  /**
   * Refreshes active omens to update their buff.
   */
  refreshOmens = (selections: Set<string>, power: number, omens?: ImmutableList<OmenDefinition>) => {
    if (!omens)
      return
    selections.filter(value => value.startsWith(OMEN_KEY)).forEach(value => {
      const index = this.getNumberFromKey(value, 1)
      const omen = omens.get(index)
      if (omen)
        this.props.enableModifiers(this.props.selected_country, value, toList(this.scaleModifier(omen.modifier, power)))
      else
        this.props.clearModifiers(this.props.selected_country, value)
    })
  }

  /**
   * Refreshes active traditions to update their buff.
   */
  refreshTraditions = (selections: Set<string>, traditions?: TraditionDefinition) => {
    if (!traditions)
      return
    selections.filter(value => value.startsWith(TRADITION_KEY)).forEach(value => {
      this.props.clearModifiers(this.props.selected_country, value)
      const column = this.getNumberFromKey(value, 1)
      const path = traditions.paths.get(column)
      if (!path)
        return
      const row = this.getNumberFromKey(value, 2)
      const tradition = path.traditions.get(row)
      if (!tradition)
        return
      this.props.enableModifiers(this.props.selected_country, value, tradition.modifiers)
    })
  }

  /**
   * Sets omen power while also re-enabling current omen.
   */
  setOmenPower = (value: string, selections: Set<string>, omens?: ImmutableList<OmenDefinition>) => {
    const power = Number(value)
    if (isNaN(power))
      return
    this.props.setOmenPower(this.props.selected_country, power)
    this.refreshOmens(selections, power, omens)
  }

  /**
   * Selects religion while also re-enabling current omen.
   */
  selectReligion = (value: ReligionType, power: number, selections: Set<string>) => {
    this.props.selectReligion(this.props.selected_country, value)
    const omens = this.props.omens.get(value)
    this.refreshOmens(selections, power, omens)
  }

  /**
   * Selects culture while also re-enabling tradition.
   */
  selectCulture = (value: CultureType, selections: Set<string>) => {
    this.props.selectCulture(this.props.selected_country, value)
    this.refreshTraditions(selections, this.props.traditions.get(value))
  }
  /**
   * Scales modifier with a given power.
   */
  scaleModifier = (modifier: Modifier, power: number) => ({ ...modifier, value: modifier.value * power / 100.0 })


  /**
   * Clears inventions above a given tech level.
   */
  clearInventions = (level: number, selections: Set<string>) => {
    selections.filter(value => value.startsWith(INVENTION_KEY) && this.getNumberFromKey(value, 1) >= level)
      .forEach(value => this.props.clearModifiers(this.props.selected_country, value))
  }

  /**
   * Enables tech levels to allow invention from a given level.
   */
  enableTech = (inventions: ImmutableList<InventionDefinition>, level: number, selections: Set<string>) => {
    mapRange(level + 1, number => number).filter(value => !selections.has(INVENTION_KEY + value + '_0'))
      .forEach(value => this.props.enableModifiers(this.props.selected_country, INVENTION_KEY + value + '_0', inventions.get(value)!.inventions.get(0)!))
  }

  /**
   * Enables an invention and all required tech levels for it.
   */
  enableInvention = (inventions: ImmutableList<InventionDefinition>, key: string, modifiers: ImmutableList<Modifier>, selections: Set<string>) => {
    this.enableTech(inventions, this.getNumberFromKey(key, 1), selections)
    this.props.enableModifiers(this.props.selected_country, key, modifiers)
  }

  /**
   * Clears all selections.
   */
  clearAll = (selections: Set<string>) => {
    KEYS.forEach(key => this.clearModifiers(key, selections))
    this.props.setOmenPower(this.props.selected_country, 100)
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

  clearInvention = (key: string, selections: Set<string>) => {
    const column = this.getNumberFromKey(key, 2)
    if (column === 0)
      this.clearInventions(this.getNumberFromKey(key, 1), selections)
    this.props.clearModifiers(this.props.selected_country, key)
  }

  getText = (modifier: Modifier): JSX.Element => {
    if (modifier.target === ModifierType.Text)
      return <span>{modifier.attribute}</span>
    return <span>{modifier.target + ' ' + modifier.attribute}</span>
  }

  getValue = (modifier: Modifier, padding: string = ''): JSX.Element | null => {
    if (!modifier.value)
      return null
    const sign = modifier.value > 0 ? '+' : '-'
    const value = Math.abs(modifier.value)
    const str = modifier.no_percent ? value + padding : +(value * 100).toFixed(2) + ' %'
    return <span className={modifier.negative ? 'value-negative' : 'value-positive'} style={{ float: 'right' }}>{sign + str}</span>
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
  mode: state.settings.mode,
  traits: state.data.traits
})

const mapDispatchToProps = (dispatch: any) => ({
  enableModifiers: (country: CountryName, key: string, modifiers: ImmutableList<Modifier>) => dispatch(enableModifiers(country, key, modifiers)),
  clearModifiers: (country: CountryName, key: string) => dispatch(clearModifiers(country, key)),
  selectCulture: (country: CountryName, culture: CultureType) => dispatch(selectCulture(country, culture)),
  selectReligion: (country: CountryName, religion: ReligionType) => dispatch(selectReligion(country, religion)),
  selectGovernment: (country: CountryName, government: GovermentType) => dispatch(selectGovernment(country, government)),
  setOmenPower: (country: CountryName, power: number) => dispatch(setOmenPower(country, power)),
  setGeneralMartial: (country: CountryName, skill: number) => dispatch(setGeneralMartial(country, skill))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Countries)
