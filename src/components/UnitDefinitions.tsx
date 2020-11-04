import React, { Component } from 'react'
import { Table, List, Icon } from 'semantic-ui-react'
import { toNumber } from 'lodash'

import {
  Mode,
  CountryName,
  UnitType,
  TerrainType,
  UnitData,
  UnitAttribute,
  UnitDefinition,
  filterAttributes,
  SiteSettings,
  Setting
} from 'types'
import { calculateValue } from 'definition_values'
import { toPercent, toManpower, toSignedPercent } from 'formatters'

import StyledNumber from './Utils/StyledNumber'
import VersusList from './VersusList'
import LabelItem from './Utils/LabelUnit'
import AttributeImage from './Utils/AttributeImage'

interface IProps {
  mode: Mode
  country: CountryName
  units: UnitDefinition[]
  settings: SiteSettings
  images: { [key in UnitType]: string[] }
  unitTypes: UnitType[]
  terrains: TerrainType[]
  onRowClick: (unit: UnitData) => void
}

// Display component for showing unit definitions for an army.
export default class UnitDefinitions extends Component<IProps> {
  attributes = [
    UnitAttribute.Discipline,
    UnitAttribute.DamageDone,
    UnitAttribute.DamageTaken,
    UnitAttribute.Offense,
    UnitAttribute.Defense,
    UnitAttribute.CombatAbility,
    UnitAttribute.MoraleDamageDone,
    UnitAttribute.MoraleDamageTaken,
    UnitAttribute.StrengthDamageDone,
    UnitAttribute.StrengthDamageTaken,
    UnitAttribute.FireDamageDone,
    UnitAttribute.FireDamageTaken,
    UnitAttribute.ShockDamageDone,
    UnitAttribute.ShockDamageTaken,
    UnitAttribute.OffensiveSupport,
    UnitAttribute.Experience,
    UnitAttribute.Drill
  ]

  filterByMode = (attributes: UnitAttribute[]) =>
    attributes.filter(attribute => {
      if (this.props.mode === Mode.Naval) {
        if (attribute === UnitAttribute.Offense || attribute === UnitAttribute.Defense) return false
      }
      if (attribute === UnitAttribute.DamageDone || attribute === UnitAttribute.DamageTaken) return false
      return true
    })

  isDamageTaken = (attribute: UnitAttribute) =>
    attribute === UnitAttribute.DamageTaken ||
    attribute === UnitAttribute.FireDamageTaken ||
    attribute === UnitAttribute.ShockDamageTaken ||
    attribute === UnitAttribute.MoraleDamageTaken ||
    attribute === UnitAttribute.StrengthDamageTaken

  render() {
    const { mode, units, country, settings } = this.props
    return (
      <Table celled selectable unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{country}</Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={UnitAttribute.Morale} settings={settings} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={UnitAttribute.Strength} mode={mode} settings={settings} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <Icon name='arrows alternate horizontal' size='big' />
            </Table.HeaderCell>
            {this.filterByMode(filterAttributes(this.attributes, settings)).map(attribute => (
              <Table.HeaderCell key={attribute}>
                <AttributeImage attribute={attribute} settings={settings} />
              </Table.HeaderCell>
            ))}
            {settings[Setting.CounteringDamage] > 0 && <Table.HeaderCell>Units</Table.HeaderCell>}
            {settings[Setting.AttributeTerrainType] && <Table.HeaderCell>Terrain</Table.HeaderCell>}
          </Table.Row>
        </Table.Header>
        <Table.Body>{units.map(this.renderRow)}</Table.Body>
      </Table>
    )
  }

  renderRow = (unit: UnitData) => {
    const { settings, onRowClick, mode } = this.props
    return (
      <Table.Row key={unit.type} onClick={() => onRowClick(unit)}>
        <Table.Cell singleLine>
          <LabelItem item={unit} />
        </Table.Cell>
        <Table.Cell>{toNumber(calculateValue(unit, UnitAttribute.Morale))}</Table.Cell>
        <Table.Cell>
          {mode === Mode.Naval
            ? toPercent(calculateValue(unit, UnitAttribute.Strength))
            : toManpower(calculateValue(unit, UnitAttribute.Strength))}
        </Table.Cell>
        <Table.Cell>{toNumber(calculateValue(unit, UnitAttribute.Maneuver))}</Table.Cell>
        {this.filterByMode(filterAttributes(this.attributes, settings)).map(attribute => (
          <Table.Cell key={attribute}>
            <StyledNumber
              value={calculateValue(unit, attribute)}
              formatter={toSignedPercent}
              hideZero
              reverse={this.isDamageTaken(attribute)}
            />
          </Table.Cell>
        ))}
        {settings[Setting.CounteringDamage] > 0 && (
          <Table.Cell>
            <VersusList item={unit} images={this.props.images} unitTypes={this.props.unitTypes} styled />
          </Table.Cell>
        )}
        {settings[Setting.AttributeTerrainType] && (
          <Table.Cell>
            <List>
              {this.props.terrains
                .filter(type => calculateValue(unit, type) !== 0)
                .map(type => (
                  <List.Item key={type}>
                    {type + ': '}
                    <StyledNumber value={calculateValue(unit, type)} formatter={toSignedPercent} />
                  </List.Item>
                ))}
            </List>
          </Table.Cell>
        )}
      </Table.Row>
    )
  }
}
