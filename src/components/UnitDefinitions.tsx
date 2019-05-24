import { List as ImmutableList } from 'immutable'
import React, { Component } from 'react'
import { Image, Table, List, Icon } from 'semantic-ui-react'
import { UnitType, UnitDefinition, UnitCalc, ArmyType, unit_to_icon, ValueType } from '../store/units'
import { TerrainType } from '../store/terrains'
import IconDiscipline from '../images/discipline.png'
import IconOffense from '../images/offense.png'
import IconDefense from '../images/defense.png'
import IconManpower from '../images/manpower.png'
import IconMorale from '../images/morale.png'

interface IProps {
  readonly army: ArmyType
  readonly units: ImmutableList<UnitDefinition>
  readonly global_stats: UnitDefinition | undefined
  readonly onRowClick: (unit: UnitDefinition) => void
}

// Display component for showing unit definitions for an army.
export default class UnitDefinitions extends Component<IProps> {

  readonly terrains = Object.keys(TerrainType).map(k => TerrainType[k as any]) as TerrainType[]
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]) as UnitType[]

  render() {
    return (
      <Table celled selectable unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              {this.props.army}
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconMorale} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconManpower} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconDiscipline} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconOffense} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconDefense} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Icon name='arrows alternate horizontal' size='big' />
            </Table.HeaderCell>
            <Table.HeaderCell>
              Morale damage
              </Table.HeaderCell>
            <Table.HeaderCell>
              Strength damage
            </Table.HeaderCell>
            <Table.HeaderCell>
              Experience
            </Table.HeaderCell>
            <Table.HeaderCell>
              Units
            </Table.HeaderCell>
            <Table.HeaderCell>
              Terrain
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            this.props.global_stats && this.renderGlobalStats(this.props.global_stats)
          }
          {
            this.props.units.map((value) => this.renderRow(value))
          }
        </Table.Body>
      </Table>
    )
  }


  renderRow = (unit: UnitDefinition) => {
    return (
      <Table.Row key={unit.type} onClick={() => this.props.onRowClick(unit)}>
        <Table.Cell singleLine>
          <Image src={unit.image} avatar />
          {unit.type}</Table.Cell>
        <Table.Cell>
          {unit.valueToNumber(UnitCalc.Morale, false)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToNumber(UnitCalc.Manpower, false)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToRelativePercent(UnitCalc.Discipline, false)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToRelativePercent(UnitCalc.Offense, false)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToRelativePercent(UnitCalc.Defense, false)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToNumber(UnitCalc.Maneuver, false)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToRelativeZeroPercent(UnitCalc.MoraleDamageTaken, false)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToRelativeZeroPercent(UnitCalc.StrengthDamageTaken, false)}
        </Table.Cell>
        <Table.Cell>
          {unit.valueToPercent(UnitCalc.Experience, false)}
        </Table.Cell>
        <Table.Cell>
          <List horizontal>
            {
              this.units.filter(type => unit.calculateValue(type) !== 0).map(type => (
                <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
                  <Image src={unit_to_icon.get(type)} avatar />
                  {unit.valueToString(type)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell>
          <List>
            {
              this.terrains.filter(type => unit.calculateValue(type) !== 0).map(type => (
                <List.Item key={type}>
                  {type + ': ' + unit.valueToString(type)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
      </Table.Row>
    )
  }

  renderGlobalStats = (unit: UnitDefinition) => {
    return (
      <Table.Row key={unit.type} onClick={() => this.props.onRowClick(unit)}>
        <Table.Cell singleLine>
          <Image src={unit.image} avatar />
          Global stats
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Morale)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Manpower)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Discipline)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Offense)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Defense)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Maneuver)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.MoraleDamageTaken)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.StrengthDamageTaken)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Experience)}
        </Table.Cell>
        <Table.Cell>
          <List horizontal>
            {
              this.units.filter(type => unit.calculateValue(type) !== 0).map(type => (
                <List.Item key={type} style={{ marginLeft: 0, marginRight: '1em' }}>
                  <Image src={unit_to_icon.get(type)} avatar />
                  {unit.valueToString(type)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell>
          <List>
            {
              this.terrains.filter(type => unit.calculateValue(type) !== 0.0).map(type => (
                <List.Item key={type}>
                  {type + ': ' + unit.valueToRelativeZeroPercent(type, false)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
      </Table.Row>
    )
  }

  renderAttributeList = (unit: UnitDefinition, attribute: ValueType) => {
    const base = unit.calculateBase(attribute)
    const modifier = unit.calculateModifier(attribute)
    const loss = unit.calculateLoss(attribute)
    return (
      <List>
        {
          base !== 0 &&
          <List.Item style={{ whiteSpace: 'nowrap' }}>
            {'Base: ' + base}
          </List.Item>
        }
        {
          modifier !== 1.0 &&
          <List.Item style={{ whiteSpace: 'nowrap' }}>
            {'Mod: ' + modifier}
          </List.Item>
        }
        {
          loss !== 0 &&
          <List.Item style={{ whiteSpace: 'nowrap' }}>
            {'Loss: ' + loss}
          </List.Item>
        }
      </List>
    )
  }
}
