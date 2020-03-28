import React, { Component } from 'react'
import { Table, List, Icon } from 'semantic-ui-react'
import { toNumber } from 'lodash'

import { Mode, CountryName, UnitType, TerrainType, BaseUnit, UnitAttribute, UnitValueType, Unit } from 'types'
import { calculateValue, calculateBase, calculateModifier, calculateLoss } from 'definition_values'
import { toPercent, toManpower, toSignedPercent, hideZero } from 'formatters'

import StyledNumber from './Utils/StyledNumber'
import VersusList from './VersusList'
import LabelItem from './Utils/LabelUnit'
import AttributeImage from './Utils/AttributeImage'

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
    return (
      <Table celled selectable unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              {country}
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={UnitAttribute.Morale} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={UnitAttribute.Strength} mode={mode} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={UnitAttribute.Discipline} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={mode === Mode.Naval ? UnitAttribute.DamageDone : UnitAttribute.Offense} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={mode === Mode.Naval ? UnitAttribute.DamageTaken : UnitAttribute.Defense} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Icon name='arrows alternate horizontal' size='big' />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={UnitAttribute.MoraleDamageDone} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={UnitAttribute.MoraleDamageTaken} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={UnitAttribute.StrengthDamageDone} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={UnitAttribute.StrengthDamageTaken} />
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
          <LabelItem item={unit} />
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
