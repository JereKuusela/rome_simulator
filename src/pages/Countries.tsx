import React, { Component } from 'react'
import { Container, Grid, Table, List, Header } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { mapRange } from '../utils'
import { ModifierType, Modifier } from '../store/countries'

class Countries extends Component<IProps> {

  render(): JSX.Element {
    return (
      <Container>
        <Grid padded celled>
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
                    <Table celled selectable unstackable>
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
                      {
                        mapRange(rows, number => number).map(number => (
                          <Table.Row key={number}>
                            {
                              tradition.paths.map(path => {
                                const tradition = path.traditions.get(number)
                                if (!tradition)
                                  return null
                                return (
                                  <Table.Cell key={number + '_' + path.name}>
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
    return <span className='positive' style={{ float: 'right' }}>{sign + modifier.value * 100} %</span>
  }
}

const mapStateToProps = (state: AppState) => ({
  traditions: state.countries.traditions.definitions,
  tradition_types: state.countries.traditions.types,
  selections: state.countries.selections,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Countries)
