import React, { Component } from 'react'
import { Set, List as ImmutableList } from 'immutable'
import { Container, Grid, Table, List, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { mapRange } from '../utils'
import { ModifierType, Modifier, enableModifiers, clearModifiers, CountryName, TraditionDefinition, TradeDefinition, HeritageDefinition, InventionDefinition, Tradition } from '../store/countries'
import CountryManager from '../containers/CountryManager'
import DropdownSelector from '../components/DropdownSelector'

class Countries extends Component<IProps> {

  render(): JSX.Element {
    const selections = this.props.selections.get(this.props.country)!
    const modifiers = selections.selections
    const tradition = this.props.traditions.get(selections.tradition)
    return (
      <Container>
        <CountryManager />
        <Grid>
          <Grid.Row columns='1'>
            <Grid.Column>
              <DropdownSelector
                items={this.props.traditions.keySeq()}
                active={selections.tradition}
                onSelect={item => { }}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <Header>{selections.tradition + ' traditions'}</Header>
              {
                tradition && this.renderTraditions(tradition, modifiers)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <Header>Trade</Header>
              {
                this.renderTrades(this.props.trades, modifiers)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <Header>Heritage</Header>
              {
                this.renderHeritages(this.props.heritages, modifiers)
              }
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <Header>Technology & Inventions</Header>
              {
                this.renderInventions(this.props.inventions, modifiers)
              }
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }

  renderTraditions = (tradition: TraditionDefinition, selections: Set<string>) => {
    const rows = tradition.paths.reduce((max, path) => Math.max(max, path.traditions.size), 0)
    return (

      <Table celled unstackable>
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
                    const key = 'tradition_' + column + '_' + row
                    return (
                      <Table.Cell
                        key={row + '_' + path.name}
                        positive={selections.has(key)}
                        selectable
                        onClick={
                          selections.has(key)
                            ? () => this.enableTradition(path.traditions, column, row - 1, selections)
                            : () => this.enableTradition(path.traditions, column, row, selections)
                        }
                        style={{ padding: '.78571429em .78571429em' }}
                      >
                        <List>
                          {
                            tradition.modifiers.map(modifier => (
                              <List.Item>
                                {
                                  this.getText(modifier)
                                }
                                {
                                  this.getValue(modifier)
                                }
                              </List.Item>
                            ))
                          }
                        </List>
                      </Table.Cell>
                    )
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
    )
  }

  TRADE_COLUMNS = 4.0

  renderTrades = (trades: ImmutableList<TradeDefinition>, selections: Set<string>) => {
    const rows = Math.ceil(trades.count() / this.TRADE_COLUMNS)
    return (
      <Table celled unstackable>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(this.TRADE_COLUMNS, number => number).map(column => {
                    const index = row * this.TRADE_COLUMNS + column
                    const trade = trades.get(index)
                    const key = 'trade_' + index
                    if (!trade)
                      return (<Table.Cell key={key}></Table.Cell>)
                    const modifier = trade.modifier
                    return (
                      <Table.Cell
                        key={key}
                        positive={selections.has(key)}
                        selectable
                        onClick={
                          selections.has(key)
                            ? () => this.props.clearModifiers(this.props.country, key)
                            : () => this.props.enableModifiers(this.props.country, key, ImmutableList<Modifier>().push(modifier))
                        }
                        style={{ padding: '.78571429em .78571429em' }}
                      >
                        <List>
                          <List.Item>
                            {
                              trade.type + ' ' + trade.name + ': '
                            }
                            {
                              this.getText(modifier)
                            }
                            {
                              this.getValue(modifier)
                            }
                          </List.Item>
                        </List>
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

  HERITAGE_COLUMNS = 4.0

  renderHeritages = (heritages: ImmutableList<HeritageDefinition>, selections: Set<string>) => {
    const rows = Math.ceil(heritages.count() / this.HERITAGE_COLUMNS)
    return (
      <Table celled unstackable>
        <Table.Body>
          {
            mapRange(rows, number => number).map(row => (
              <Table.Row key={row}>
                {
                  mapRange(this.HERITAGE_COLUMNS, number => number).map(column => {
                    const index = row * this.HERITAGE_COLUMNS + column
                    const heritage = heritages.get(index)
                    const key = 'heritage_' + index
                    if (!heritage)
                      return (<Table.Cell key={key}></Table.Cell>)
                    const modifiers = heritage.modifiers
                    return (
                      <Table.Cell
                        key={key}
                        positive={selections.has(key)}
                        selectable
                        onClick={
                          selections.has(key)
                            ? () => this.props.clearModifiers(this.props.country, key)
                            : () => this.enableHeritage(key, modifiers, selections)
                        }
                        style={{ padding: '.78571429em .78571429em' }}
                      >
                        <List>
                          <List.Item>
                            <List.Header>
                              {heritage.name}
                            </List.Header>
                          </List.Item>
                          {
                            modifiers.map(modifier => (
                              <List.Item>
                                {
                                  this.getText(modifier)
                                }
                                {
                                  this.getValue(modifier, '\u00a0\u00a0\u00a0\u00a0')
                                }
                              </List.Item>
                            ))
                          }
                        </List>
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

  renderInventions = (inventions: ImmutableList<InventionDefinition>, selections: Set<string>) => {
    return (
      <Table celled unstackable definition>
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
                    const key = 'invention_' + row + '_' + column
                    return (
                      <Table.Cell
                        key={key}
                        positive={selections.has(key)}
                        selectable
                        onClick={
                          selections.has(key)
                            ? () => this.clearInvention(key, selections)
                            : () => this.enableInvention(inventions, key, invention, selections)
                        }
                        style={{ padding: '.78571429em .78571429em' }}
                      >
                        <List>
                          {
                            invention.map(modifier => (
                              <List.Item>
                                {
                                  this.getText(modifier)
                                }
                                {
                                  this.getValue(modifier)
                                }
                              </List.Item>
                            ))
                          }
                        </List>
                      </Table.Cell>
                    )
                  })
                }
              </Table.Row>
            ))
          }
        </Table.Body>
      </Table>
    )
  }

  /**
   * Clears all heritages.
   */
  clearHeritages = (selections: Set<string>) => {
    selections.filter(value => value.startsWith('heritage_')).forEach(value => this.props.clearModifiers(this.props.country, value))
  }

  /**
   * Clears traditions from a given column above a given row.
   */
  clearTraditions = (column: number, row: number, selections: Set<string>) => {
    const key = 'tradition_' + column
    selections.filter(value => value.startsWith(key) && this.getNumberFromKey(value, 2) > row)
      .forEach(value => this.props.clearModifiers(this.props.country, value))
  }

  /**
   * Enables traditions from a given column up to a given row.
   */
  enableTraditions = (traditions: ImmutableList<Tradition>, column: number, row: number, selections: Set<string>) => {
    mapRange(row + 1, number => number).filter(value => !selections.has('tradition_' + column + '_' + value))
      .forEach(value => this.props.enableModifiers(this.props.country, 'tradition_' + column + '_' + value, traditions.get(value)!.modifiers))
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
    this.clearHeritages(selections)
    this.props.enableModifiers(this.props.country, key, modifiers)
  }

  /**
   * Clears inventions above a given tech level.
   */
  clearInventions = (level: number, selections: Set<string>) => {
    selections.filter(value => value.startsWith('invention_') && this.getNumberFromKey(value, 1) >= level)
      .forEach(value => this.props.clearModifiers(this.props.country, value))
  }

  /**
   * Enables tech levels to allow invention from a given level.
   */
  enableTech = (inventions: ImmutableList<InventionDefinition>, level: number, selections: Set<string>) => {
    mapRange(level + 1, number => number).filter(value => !selections.has('invention_' + value + '_0'))
      .forEach(value => this.props.enableModifiers(this.props.country, 'invention_' + value + '_0', inventions.get(value)!.inventions.get(0)!))
  }

  /**
   * Enables an invention and all required tech levels for it.
   */
  enableInvention = (inventions: ImmutableList<InventionDefinition>, key: string, modifiers: ImmutableList<Modifier>, selections: Set<string>) => {
    this.enableTech(inventions, this.getNumberFromKey(key, 1), selections)
    this.props.enableModifiers(this.props.country, key, modifiers)
  }

  clearInvention = (key: string, selections: Set<string>) => {
    const column = this.getNumberFromKey(key, 2)
    if (column === 0)
      this.clearInventions(this.getNumberFromKey(key, 1), selections)
    this.props.clearModifiers(this.props.country, key)
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
    const str = value >= 1 || modifier.no_percent ? value + padding : value * 100 + ' %'
    return <span className={modifier.negative ? 'value-negative' : 'value-positive'} style={{ float: 'right' }}>{sign + str}</span>
  }

  getNumberFromKey = (key: string, index: number) => {
    const split = key.split('_')
    if (split.length > index)
      return Number(split[index])
    return -1
  }
}

const mapStateToProps = (state: AppState) => ({
  traditions: state.countries.traditions,
  trades: state.countries.trades,
  heritages: state.countries.heritages,
  inventions: state.countries.inventions,
  selections: state.countries.selections,
  country: state.settings.country,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  enableModifiers: (country: CountryName, key: string, modifiers: ImmutableList<Modifier>) => (dispatch(enableModifiers(country, key, modifiers))),
  clearModifiers: (country: CountryName, key: string) => (dispatch(clearModifiers(country, key)))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Countries)
