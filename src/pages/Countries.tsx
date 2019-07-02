import React, { Component } from 'react'
import { Container, Grid, Table, List, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { mapRange } from '../utils'
import { ModifierType, Modifier, Tradition, enableTradition, clearTradition, CountryName } from '../store/countries'
import CountryManager from '../containers/CountryManager'

class Countries extends Component<IProps> {

  render(): JSX.Element {
    const selections = this.props.selections.get(this.props.country)!.traditions
    return (
      <Container>
        <Grid>
          <Grid.Row columns='1'>
            <Grid.Column>
              <CountryManager />
            </Grid.Column>
          </Grid.Row>
          {
            this.props.tradition_types.map(type => {
              const tradition = this.props.traditions.get(type)
              if (!tradition)
                return null
              const rows = tradition.paths.reduce((max, path) => Math.max(max, path.traditions.size), 0)
              return (
                <Grid.Row columns='1'>
                  <Grid.Column key={type}>
                    <Header>{tradition.type}</Header>
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
                                          ? () => this.props.clearTradition(this.props.country, key)
                                          : () => this.props.enableTradition(this.props.country, key, tradition)
                                      }
                                      style={{padding: '.78571429em .78571429em'}}
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
                  </Grid.Column>
                </Grid.Row>
              )
            })
          }
        </Grid>
      </Container>
    )
  }

  getText = (modifier: Modifier): JSX.Element => {
    if (modifier.type === ModifierType.Text)
      return <span>{modifier.attribute}</span>
    return <span>{modifier.type + ' ' + modifier.attribute}</span>
  }

  getValue = (modifier: Modifier): JSX.Element | null => {
    if (!modifier.value)
      return null
    const sign = modifier.value > 0 ? '+' : ''
    return <span className='value-positive' style={{ float: 'right' }}>{sign + modifier.value * 100} %</span>
  }
}

const mapStateToProps = (state: AppState) => ({
  traditions: state.countries.traditions.definitions,
  tradition_types: state.countries.traditions.types,
  selections: state.countries.selections,
  country: state.settings.country,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  enableTradition: (country: CountryName, key: string, tradition: Tradition) => (dispatch(enableTradition(country, key, tradition))),
  clearTradition: (country: CountryName, key: string) => (dispatch(clearTradition(country, key)))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Countries)
