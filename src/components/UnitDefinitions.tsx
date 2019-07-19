import { OrderedSet, OrderedMap, Map } from 'immutable'
import React, { Component } from 'react'
import { Image, Table, List, Icon } from 'semantic-ui-react'
import { UnitType, UnitDefinition, UnitCalc, ValueType, valueToString } from '../store/units'
import { TerrainType } from '../store/terrains'
import IconDiscipline from '../images/discipline.png'
import IconOffense from '../images/offense.png'
import IconDefense from '../images/defense.png'
import IconManpower from '../images/manpower.png'
import IconStrength from '../images/naval_combat.png'
import IconMorale from '../images/morale.png'
import IconAttrition from '../images/attrition.png'
import { getImage, calculateValue, calculateBase, calculateModifier, calculateLoss, valueToNumber, valueToPercent, valueToRelativeZeroPercent, mergeValues, valueToManpower, DefinitionType } from '../base_definition'
import { toRelativeZeroPercent, toNumber, hideZero, toPercent } from '../formatters'
import { CountryName } from '../store/countries'
import { filterUnits } from '../utils'
import StyledNumber from './StyledNumber'
import VersusList from './VersusList'

interface IProps {
  readonly mode: DefinitionType
  readonly country: CountryName
  readonly units: Map<CountryName, OrderedMap<UnitType, UnitDefinition>>
  readonly unit_types: OrderedSet<UnitType>
  readonly terrains: OrderedSet<TerrainType>
  readonly global_stats: UnitDefinition
  readonly onRowClick: (unit: UnitDefinition) => void
}

// Display component for showing unit definitions for an army.
export default class UnitDefinitions extends Component<IProps> {

  render(): JSX.Element {
    const units = filterUnits(this.props.mode, this.props.units.get(this.props.country)).toList()
    return (
      <Table celled selectable unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              {this.props.country}
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconMorale} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={this.props.mode === DefinitionType.Naval ? IconStrength : IconManpower} avatar />
            </Table.HeaderCell>
            {
              this.props.mode === DefinitionType.Naval ? null :
                <Table.HeaderCell>
                  <Image src={IconDiscipline} avatar />
                </Table.HeaderCell>
            }
            <Table.HeaderCell>
              <Image src={IconOffense} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={this.props.mode === DefinitionType.Naval ? IconAttrition : IconDefense} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Icon name='arrows alternate horizontal' size='big' />
            </Table.HeaderCell>
            {
              this.props.mode !== DefinitionType.Naval ? null :
                <Table.HeaderCell>
                  <Image src={IconOffense} avatar />
                  <Image src={IconMorale} avatar />
                </Table.HeaderCell>
            }
            <Table.HeaderCell>
              <Image src={IconAttrition} avatar />
              <Image src={IconMorale} avatar />
            </Table.HeaderCell>
            {
              this.props.mode !== DefinitionType.Naval ? null :
                <Table.HeaderCell>
                  <Image src={IconOffense} avatar />
                  <Image src={IconStrength} avatar />
                </Table.HeaderCell>
            }
            <Table.HeaderCell>
              <Image src={IconAttrition} avatar />
              <Image src={this.props.mode === DefinitionType.Naval ? IconStrength : IconManpower} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              Starting Experience
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
            this.renderGlobalStats(this.props.global_stats)
          }
          {
            units.map(this.renderRow)
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (definition: UnitDefinition): JSX.Element => {
    const unit = mergeValues(definition, this.props.global_stats)
    return (
      <Table.Row key={unit.type} onClick={() => this.props.onRowClick(unit)}>
        <Table.Cell singleLine>
          <Image src={getImage(unit)} avatar />
          {unit.type}
        </Table.Cell>
        <Table.Cell>
          {valueToNumber(unit, UnitCalc.Morale, false)}
        </Table.Cell>
        <Table.Cell>
          {this.props.mode === DefinitionType.Naval ? valueToPercent(unit, UnitCalc.Strength, false) : valueToManpower(unit, UnitCalc.Strength, false)}
        </Table.Cell>
        {
          this.props.mode === DefinitionType.Naval ? null :
            <Table.Cell>
              <StyledNumber
                value={calculateValue(unit, UnitCalc.Discipline)}
                formatter={toRelativeZeroPercent} hide_zero
              />
            </Table.Cell>
        }
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, this.props.mode === DefinitionType.Naval ? UnitCalc.DamageDone : UnitCalc.Offense)}
            formatter={toRelativeZeroPercent} hide_zero
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, this.props.mode === DefinitionType.Naval ? UnitCalc.DamageTaken : UnitCalc.Defense)}
            formatter={toRelativeZeroPercent} hide_zero
            reverse={this.props.mode === DefinitionType.Naval}
          />
        </Table.Cell>
        <Table.Cell>
          {toNumber(calculateValue(unit, UnitCalc.Maneuver))}
        </Table.Cell>
        {
          this.props.mode !== DefinitionType.Naval ? null :
            <Table.Cell>
              <StyledNumber
                value={calculateValue(unit, UnitCalc.MoraleDamageDone)}
                formatter={toRelativeZeroPercent} hide_zero
              />
            </Table.Cell>
        }
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitCalc.MoraleDamageTaken)}
            formatter={toRelativeZeroPercent} hide_zero
            reverse
          />
        </Table.Cell>
        {
          this.props.mode !== DefinitionType.Naval ? null :
            <Table.Cell>
              <StyledNumber
                value={calculateValue(unit, UnitCalc.StrengthDamageDone)}
                formatter={toRelativeZeroPercent} hide_zero
              />
            </Table.Cell>
        }
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitCalc.StrengthDamageTaken)}
            formatter={toRelativeZeroPercent} hide_zero
            reverse
          />
        </Table.Cell>
        <Table.Cell>
          {toPercent(hideZero(calculateValue(unit, UnitCalc.Experience)))}
        </Table.Cell>
        <Table.Cell>
          <VersusList
            item={unit}
            units={this.props.units}
            unit_types={this.props.unit_types}
            styled
          />
        </Table.Cell>
        <Table.Cell>
          <List>
            {
              this.props.terrains.filter(type => calculateValue(unit, type) !== 0).map(type => (
                <List.Item key={type}>
                  {type + ': '}
                  <StyledNumber
                    value={calculateValue(unit, type)}
                    formatter={toRelativeZeroPercent}
                  />
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
      </Table.Row>
    )
  }

  renderGlobalStats = (unit: UnitDefinition): JSX.Element => {
    return (
      <Table.Row key={unit.type} onClick={() => this.props.onRowClick(unit)}>
        <Table.Cell singleLine>
          <Image src={getImage(unit)} avatar />
          Global stats
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Morale)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Strength)}
        </Table.Cell>
        {
          this.props.mode === DefinitionType.Naval ? null :
            <Table.Cell>
              {this.renderAttributeList(unit, UnitCalc.Discipline)}
            </Table.Cell>
        }
        <Table.Cell>
          {this.renderAttributeList(unit, this.props.mode === DefinitionType.Naval ? UnitCalc.DamageDone : UnitCalc.Offense)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, this.props.mode === DefinitionType.Naval ? UnitCalc.DamageTaken : UnitCalc.Defense)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Maneuver)}
        </Table.Cell>
        {
          this.props.mode !== DefinitionType.Naval ? null :
            <Table.Cell>
              {this.renderAttributeList(unit, UnitCalc.MoraleDamageDone)}
            </Table.Cell>
        }
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.MoraleDamageTaken)}
        </Table.Cell>
        {
          this.props.mode !== DefinitionType.Naval ? null :
            <Table.Cell>
              {this.renderAttributeList(unit, UnitCalc.StrengthDamageDone)}
            </Table.Cell>
        }
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.StrengthDamageTaken)}
        </Table.Cell>
        <Table.Cell>
          {this.renderAttributeList(unit, UnitCalc.Experience)}
        </Table.Cell>
        <Table.Cell>
          <VersusList
            item={unit}
            units={this.props.units}
            unit_types={this.props.unit_types}
          />
        </Table.Cell>
        <Table.Cell>
          <List>
            {
              this.props.terrains.filter(type => calculateValue(unit, type) !== 0.0).map(type => (
                <List.Item key={type}>
                  {type + ': ' + valueToRelativeZeroPercent(unit, type, false)}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
      </Table.Row>
    )
  }

  renderAttributeList = (unit: UnitDefinition, attribute: ValueType): JSX.Element => {
    const base = calculateBase(unit, attribute)
    let base_str = String(base)
    if (this.props.mode === DefinitionType.Naval && attribute === UnitCalc.Strength)
      base_str = String(base * 100) + '%'
    if (this.props.mode !== DefinitionType.Naval && attribute === UnitCalc.Strength)
      base_str = String(base * 1000)
    const modifier = calculateModifier(unit, attribute)
    const loss = calculateLoss(unit, attribute)
    let loss_str = String(base)
    if (this.props.mode === DefinitionType.Naval && attribute === UnitCalc.Strength)
      loss_str = String(loss * 100) + '%'
    if (this.props.mode !== DefinitionType.Naval && attribute === UnitCalc.Strength)
      loss_str = String(loss * 1000)
    return (
      <List>
        {
          base !== 0 &&
          <List.Item style={{ whiteSpace: 'nowrap' }}>
            {'Base: ' + base_str}
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
            {'Loss: ' + loss_str}
          </List.Item>
        }
      </List>
    )
  }
}
