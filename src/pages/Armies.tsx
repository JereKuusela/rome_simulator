import React, { Component } from 'react'
import { Set, List as ImmutableList } from 'immutable'
import { Container, Grid, Table, List } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from '../store/index'
import { mapRange, getBattle } from '../utils'
import {
  TraitDefinition, Modifier, ModifierType
} from '../store/data'
import {
  CountryName
} from '../store/countries'
import AccordionToggle from '../containers/AccordionToggle'
import { ArmyName } from '../store/battle'
import { enableModifiers, clearModifiers, selectCountry } from '../store/armies'
import ArmyManager from '../containers/ArmyManager'
import DropdownSelector from '../components/DropdownSelector'

const TRAIT_COLUMNS = 4.0
const TRAIT_KEY = 'trait_'
const padding = '.78571429em .78571429em'

class Armies extends Component<IProps> {

  render(): JSX.Element {
    const army = this.props.armies.get(this.props.selected_army)!
    const selections = army.selections
    return (
      <Container>
        <ArmyManager />
        <Grid>
          <Grid.Row columns='1'>
            <Grid.Column>
              <DropdownSelector
                items={this.props.countries.keySeq()}
                active={army.country}
                onSelect={item => this.props.selectCountry(this.props.selected_army, item)}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='General' identifier='armies_traits'>
                {
                  this.renderTraits(this.props.traits, selections)
                }
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
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
                    const key = TRAIT_KEY + index
                    if (!trait)
                      return (<Table.Cell key={key}></Table.Cell>)
                    const modifiers = trait.modifiers
                    return (
                      <Table.Cell
                        key={key}
                        positive={selections.has(key)}
                        selectable
                        onClick={
                          selections.has(key)
                            ? () => this.props.clearModifiers(this.props.selected_army, key)
                            : () => this.props.enableModifiers(this.props.selected_army, key, modifiers)
                        }
                        style={{ padding }}
                      >
                        <List>
                          <List.Item>
                            <List.Header>
                              {trait.name}
                            </List.Header>
                          </List.Item>
                          {
                            modifiers.map(modifier => (
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
      </Table >
    )
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
}

const mapStateToProps = (state: AppState) => ({
  armies: getBattle(state).armies,
  countries: state.countries,
  selected_army: state.settings.army,
  traits: state.data.traits,
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  enableModifiers: (army: ArmyName, key: string, modifiers: ImmutableList<Modifier>) => dispatch(enableModifiers(army, key, modifiers)),
  clearModifiers: (army: ArmyName, key: string) => dispatch(clearModifiers(army, key)),
  selectCountry: (army: ArmyName, country: CountryName) => dispatch(selectCountry(army, country))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> { }

export default connect(mapStateToProps, mapDispatchToProps)(Armies)
