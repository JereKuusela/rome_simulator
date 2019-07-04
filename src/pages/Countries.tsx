import React, { Component } from 'react'
import { Set, List as ImmutableList } from 'immutable'
import { Container, Grid, Table, List, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { mapRange } from '../utils'
import { ModifierType, Modifier, enableModifiers, clearModifiers, CountryName, TraditionDefinition, TradeDefinition } from '../store/countries'
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
                    const previous_taken = row === 0 || selections.has('tradition_' + column + '_' + (row - 1))
                    const next_taken = selections.has('tradition_' + column + '_' + (row + 1))
                    return (
                      <Table.Cell
                        key={row + '_' + path.name}
                        positive={selections.has(key)}
                        selectable
                        disabled={next_taken || !previous_taken}
                        onClick={
                          selections.has(key)
                            ? () => this.props.clearModifiers(this.props.country, key)
                            : () => this.props.enableModifiers(this.props.country, key, tradition.modifiers)
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
                    if (!trade)
                      return null
                    const modifier = trade.modifier
                    const key = 'trade_' + index
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

  getText = (modifier: Modifier): JSX.Element => {
    if (modifier.target === ModifierType.Text)
      return <span>{modifier.attribute}</span>
    return <span>{modifier.target + ' ' + modifier.attribute}</span>
  }

  getValue = (modifier: Modifier): JSX.Element | null => {
    if (!modifier.value)
      return null
    const sign = modifier.value > 0 ? '+' : ''
    return <span className='value-positive' style={{ float: 'right' }}>{sign + modifier.value * 100} %</span>
  }
}

const mapStateToProps = (state: AppState) => ({
  traditions: state.countries.traditions,
  trades: state.countries.trades,
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
