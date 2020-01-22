import React, { Component } from 'react'
import { Image, Table, List, Icon } from 'semantic-ui-react'
import { sortBy, toNumber } from 'lodash'

import { Mode, DefinitionType, getImage } from 'base_definition'
import { CountryName, UnitType, TerrainType, UnitDefinition, UnitCalc, UnitValueType } from 'types'
import { toArr } from 'utils'
import { unitSorter } from 'managers/army_manager'
import { mergeValues, calculateValue, calculateBase, calculateModifier, calculateLoss } from 'definition_values'
import { toPercent, toManpower, toSignedPercent, hideZero } from 'formatters'

import StyledNumber from './Utils/StyledNumber'
import VersusList from './VersusList'
import IconDiscipline from '../images/discipline.png'
import IconOffense from '../images/offense.png'
import IconDefense from '../images/defense.png'
import IconManpower from '../images/manpower.png'
import IconStrength from '../images/naval_combat.png'
import IconMorale from '../images/morale.png'
import IconAttrition from '../images/attrition.png'
import { UnitDefinitions as Units } from 'reducers'

interface IProps {
  mode: Mode
  country: CountryName
  definitions: Units
  images: { [key in UnitType]: string[] }
  unit_types: UnitType[]
  terrains: TerrainType[]
  base_definition: UnitDefinition
  onRowClick: (unit: UnitDefinition) => void
}

// Display component for showing unit definitions for an army.
export default class UnitDefinitions extends Component<IProps> {

  render() {
    const { mode, definitions, country, base_definition } = this.props
    const sorted_units = sortBy(toArr(definitions), definition => unitSorter(definition, mode))
    const icon_strength = mode === DefinitionType.Naval ? IconStrength : IconManpower
    return (
      <Table celled selectable unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              {country}
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconMorale} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={icon_strength} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconDiscipline} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconOffense} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={mode === DefinitionType.Naval ? IconAttrition : IconDefense} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Icon name='arrows alternate horizontal' size='big' />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconOffense} avatar />
              <Image src={IconMorale} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconAttrition} avatar />
              <Image src={IconMorale} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconOffense} avatar />
              <Image src={icon_strength} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Image src={IconAttrition} avatar />
              <Image src={icon_strength} avatar />
            </Table.HeaderCell>
            <Table.HeaderCell>
              Exp
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
            this.renderGlobalStats(base_definition)
          }
          {
            sorted_units.map(this.renderRow)
          }
        </Table.Body>
      </Table>
    )
  }

  renderRow = (definition: UnitDefinition) => {
    const unit = mergeValues(definition, this.props.base_definition)
    return (
      <Table.Row key={unit.type} onClick={() => this.props.onRowClick(unit)}>
        <Table.Cell singleLine>
          <Image src={getImage(unit)} avatar />
          {unit.type}
        </Table.Cell>
        <Table.Cell>
          {toNumber(calculateValue(unit, UnitCalc.Morale))}
        </Table.Cell>
        <Table.Cell>
          {this.props.mode === DefinitionType.Naval ? toPercent(calculateValue(unit, UnitCalc.Strength)) : toManpower(calculateValue(unit, UnitCalc.Strength))}
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitCalc.Discipline)}
            formatter={toSignedPercent} hide_zero
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, this.props.mode === DefinitionType.Naval ? UnitCalc.DamageDone : UnitCalc.Offense)}
            formatter={toSignedPercent} hide_zero
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, this.props.mode === DefinitionType.Naval ? UnitCalc.DamageTaken : UnitCalc.Defense)}
            formatter={toSignedPercent} hide_zero
            reverse={this.props.mode === DefinitionType.Naval}
          />
        </Table.Cell>
        <Table.Cell>
          {toNumber(calculateValue(unit, UnitCalc.Maneuver))}
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitCalc.MoraleDamageDone)}
            formatter={toSignedPercent} hide_zero
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitCalc.MoraleDamageTaken)}
            formatter={toSignedPercent} hide_zero
            reverse
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitCalc.StrengthDamageDone)}
            formatter={toSignedPercent} hide_zero
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitCalc.StrengthDamageTaken)}
            formatter={toSignedPercent} hide_zero
            reverse
          />
        </Table.Cell>
        <Table.Cell>
          {toPercent(hideZero(calculateValue(unit, UnitCalc.Experience)))}
        </Table.Cell>
        <Table.Cell>
          <VersusList
            item={unit}
            images={this.props.images}
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
                    formatter={toSignedPercent}
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
          All units
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
            images={this.props.images}
            unit_types={this.props.unit_types}
          />
        </Table.Cell>
        <Table.Cell>
          <List>
            {
              Array.from(this.props.terrains).filter(type => calculateValue(unit, type) !== 0.0).map(type => (
                <List.Item key={type}>
                  {type + ': ' + toSignedPercent(calculateValue(unit, type))}
                </List.Item>
              ))
            }
          </List>
        </Table.Cell>
        <Table.Cell />
        {
          this.props.mode === DefinitionType.Naval ? null :
            <Table.Cell />
        }
      </Table.Row>
    )
  }

  renderAttributeList = (unit: UnitDefinition, attribute: UnitValueType): JSX.Element => {
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
