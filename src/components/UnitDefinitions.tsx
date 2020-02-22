import React, { Component } from 'react'
import { Image, Table, List, Icon } from 'semantic-ui-react'
import { sortBy, toNumber } from 'lodash'

import { Mode, CountryName, UnitType, TerrainType, BaseUnit, UnitAttribute, UnitValueType, Units, Unit } from 'types'
import { toArr, getImage } from 'utils'
import { unitSorter } from 'managers/army'
import { calculateValue, calculateBase, calculateModifier, calculateLoss } from 'definition_values'
import { toPercent, toManpower, toSignedPercent, hideZero } from 'formatters'

import StyledNumber from './Utils/StyledNumber'
import VersusList from './VersusList'
import IconDiscipline from 'images/discipline.png'
import IconOffense from 'images/offense.png'
import IconDefense from 'images/defense.png'
import IconManpower from 'images/manpower.png'
import IconStrength from 'images/naval_combat.png'
import IconMorale from 'images/morale.png'
import IconAttrition from 'images/attrition.png'

interface IProps {
  mode: Mode
  country: CountryName
  units: Unit[]
  images: { [key in UnitType]: string[] }
  unit_types: UnitType[]
  terrains: TerrainType[]
  onRowClick: (unit: BaseUnit) => void
}

// Display component for showing unit definitions for an army.
export default class UnitDefinitions extends Component<IProps> {

  render() {
    const { mode, units, country } = this.props
    const icon_strength = mode === Mode.Naval ? IconStrength : IconManpower
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
              <Image src={mode === Mode.Naval ? IconAttrition : IconDefense} avatar />
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
          {units.map(this.renderRow)}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (unit: BaseUnit) => {
    return (
      <Table.Row key={unit.type} onClick={() => this.props.onRowClick(unit)}>
        <Table.Cell singleLine>
          {unit.tech}
          <Image src={getImage(unit)} avatar />
          {unit.type}
        </Table.Cell>
        <Table.Cell>
          {toNumber(calculateValue(unit, UnitAttribute.Morale))}
        </Table.Cell>
        <Table.Cell>
          {this.props.mode === Mode.Naval ? toPercent(calculateValue(unit, UnitAttribute.Strength)) : toManpower(calculateValue(unit, UnitAttribute.Strength))}
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitAttribute.Discipline)}
            formatter={toSignedPercent} hide_zero
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, this.props.mode === Mode.Naval ? UnitAttribute.DamageDone : UnitAttribute.Offense)}
            formatter={toSignedPercent} hide_zero
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, this.props.mode === Mode.Naval ? UnitAttribute.DamageTaken : UnitAttribute.Defense)}
            formatter={toSignedPercent} hide_zero
            reverse={this.props.mode === Mode.Naval}
          />
        </Table.Cell>
        <Table.Cell>
          {toNumber(calculateValue(unit, UnitAttribute.Maneuver))}
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitAttribute.MoraleDamageDone)}
            formatter={toSignedPercent} hide_zero
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitAttribute.MoraleDamageTaken)}
            formatter={toSignedPercent} hide_zero
            reverse
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitAttribute.StrengthDamageDone)}
            formatter={toSignedPercent} hide_zero
          />
        </Table.Cell>
        <Table.Cell>
          <StyledNumber
            value={calculateValue(unit, UnitAttribute.StrengthDamageTaken)}
            formatter={toSignedPercent} hide_zero
            reverse
          />
        </Table.Cell>
        <Table.Cell>
          {toPercent(hideZero(calculateValue(unit, UnitAttribute.Experience)))}
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

  renderAttributeList = (unit: BaseUnit, attribute: UnitValueType): JSX.Element => {
    const base = calculateBase(unit, attribute)
    let base_str = String(base)
    if (this.props.mode === Mode.Naval && attribute === UnitAttribute.Strength)
      base_str = String(base * 100) + '%'
    if (this.props.mode !== Mode.Naval && attribute === UnitAttribute.Strength)
      base_str = String(base * 1000)
    const modifier = calculateModifier(unit, attribute)
    const loss = calculateLoss(unit, attribute)
    let loss_str = String(base)
    if (this.props.mode === Mode.Naval && attribute === UnitAttribute.Strength)
      loss_str = String(loss * 100) + '%'
    if (this.props.mode !== Mode.Naval && attribute === UnitAttribute.Strength)
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
