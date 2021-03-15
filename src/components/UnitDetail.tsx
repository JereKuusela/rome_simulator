import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import PaddedRow from './Utils/PaddedRow'
import DetailToggleRow from './Detail/DetailToggleRow'
import DetailTextRow from './Detail/DetailTextRow'
import DetailInputRow from './Detail/DetailInputRow'
import DetailDropdownRow from './Detail/DetailDropdownRow'
import Headers from './Utils/Headers'
import {
  Mode,
  ValuesType,
  CohortDefinition,
  UnitType,
  TerrainType,
  UnitRole,
  UnitAttribute,
  UnitValueType,
  unitValueToString,
  Setting,
  CombatPhase,
  isAttributeEnabled,
  SiteSettings,
  getTerrainAttributes
} from 'types'
import { values } from 'utils'
import { getValue, calculateValue, explain } from 'definition_values'
import { toMaintenance } from 'formatters'
import DelayedNumericInput from './Detail/DelayedNumericInput'

interface IProps {
  mode: Mode
  settings: SiteSettings
  customValueKey: string
  unit: CohortDefinition
  unitTypes?: UnitType[]
  unitTypesWithParent?: UnitType[]
  showStatistics: boolean
  terrainTypes?: TerrainType[]
  unitTypesAsDropdown?: boolean
  onCustomBaseValueChange: (key: string, attribute: UnitValueType, value: number) => void
  onCustomModifierValueChange: (key: string, attribute: UnitValueType, value: number) => void
  onCustomLossModifierValueChange: (key: string, attribute: UnitValueType, value: number) => void
  onTypeChange?: (type: UnitType) => void
  onParentChange?: (type: UnitType) => void
  onImageChange?: (image: string) => void
  onChangeDeployment?: (deployment: UnitRole) => void
  onIsLoyalToggle?: () => void
}

/**
 * Shows and allows changing unit details.
 */
export default class UnitDetail extends Component<IProps> {
  readonly attributes = values(UnitAttribute)
  readonly units = values(UnitType).sort()
  readonly modes = values(Mode)
  readonly deployments = values(UnitRole)
  readonly headers = ['Attribute', 'Value', 'Custom base', 'Custom modifier', 'Custom losses', 'Explained']

  readonly CELLS = 6

  render() {
    const { unit, onTypeChange, onParentChange, onImageChange, onChangeDeployment, onIsLoyalToggle } = this.props
    const { terrainTypes, unitTypes, unitTypesWithParent, unitTypesAsDropdown, settings } = this.props
    const { type, mode, parent, image, role, isLoyal, culture, tech } = unit

    const terrains = terrainTypes && getTerrainAttributes(terrainTypes)
    return (
      <Table celled selectable unstackable>
        <Headers values={this.headers} />
        <Table.Body>
          {onTypeChange && unitTypes && unitTypesAsDropdown && (
            <DetailDropdownRow text='Type' cells={this.CELLS} value={type} values={unitTypes} onChange={onTypeChange} />
          )}
          {onTypeChange && unitTypes && !unitTypesAsDropdown && (
            <DetailInputRow text='Name' cells={this.CELLS} value={type} onChange={onTypeChange} />
          )}
          {mode && <DetailTextRow text='Mode' cells={this.CELLS} value={mode} />}
          {settings[Setting.Culture] && culture && <DetailTextRow text='Culture' cells={this.CELLS} value={culture} />}
          {settings[Setting.Tech] && tech && <DetailTextRow text='Tech' cells={this.CELLS} value={tech} />}
          {parent && unitTypesWithParent && onParentChange && (
            <DetailDropdownRow
              text='Parent'
              cells={this.CELLS}
              value={parent}
              values={unitTypesWithParent}
              onChange={onParentChange}
            />
          )}
          {onImageChange && <DetailInputRow text='Image' cells={this.CELLS} value={image} onChange={onImageChange} />}
          {onChangeDeployment && role && (
            <DetailDropdownRow
              text='Deployment'
              cells={this.CELLS}
              value={role}
              values={this.deployments}
              onChange={onChangeDeployment}
            />
          )}
          {settings[Setting.AttributeLoyal] && (
            <DetailToggleRow text='Is loyal?' cells={this.CELLS} value={!!isLoyal} onChange={onIsLoyalToggle} />
          )}
          {this.attributes.map(attribute =>
            this.renderRow(
              attribute,
              this.allowBase(attribute),
              this.allowModifier(attribute),
              this.allowLoss(attribute)
            )
          )}
          {settings[Setting.CounteringDamage] > 0 &&
            unitTypes &&
            unitTypes.map(attribute => this.renderRow(attribute, true, false, false))}
          {settings[Setting.AttributeTerrainType] &&
            terrains &&
            terrains.map(attribute => this.renderRow(attribute, true, true, false))}
          {[CombatPhase.Fire, CombatPhase.Shock].map(attribute => this.renderRow(attribute, true, false, false))}
        </Table.Body>
      </Table>
    )
  }

  allowLoss = (attribute: UnitAttribute) => attribute === UnitAttribute.Morale || attribute === UnitAttribute.Strength

  allowModifier = (attribute: UnitAttribute) =>
    attribute === UnitAttribute.Morale ||
    attribute === UnitAttribute.Strength ||
    attribute === UnitAttribute.Maintenance ||
    attribute === UnitAttribute.Cost ||
    attribute === UnitAttribute.AttritionWeight

  allowBase = (attribute: UnitAttribute) => !this.allowModifier(attribute)

  renderRow = (attribute: UnitValueType, allowBase: boolean, allowModifier: boolean, allowLoss: boolean) => {
    const {
      unit,
      customValueKey,
      onCustomBaseValueChange,
      onCustomModifierValueChange,
      onCustomLossModifierValueChange: onCustomLossValueChange,
      settings,
      mode,
      showStatistics
    } = this.props
    if (!isAttributeEnabled(attribute, settings, mode, showStatistics)) return null
    const baseValue = getValue(ValuesType.Base, unit, attribute, customValueKey)
    const modifierValue = getValue(ValuesType.Modifier, unit, attribute, customValueKey)
    const lossValue = getValue(ValuesType.LossModifier, unit, attribute, customValueKey)
    let value = unitValueToString(unit, attribute)
    if (attribute === UnitAttribute.Maintenance)
      value +=
        ' (' +
        toMaintenance(calculateValue(unit, UnitAttribute.Cost) * calculateValue(unit, UnitAttribute.Maintenance)) +
        ')'

    return (
      <PaddedRow key={attribute} cells={this.CELLS}>
        {attribute}
        {value}
        {allowBase && (
          <DelayedNumericInput
            value={baseValue}
            onChange={value => onCustomBaseValueChange(customValueKey, attribute, value)}
          />
        )}
        {allowModifier && (
          <DelayedNumericInput
            value={modifierValue}
            onChange={value => onCustomModifierValueChange(customValueKey, attribute, value)}
          />
        )}
        {allowLoss && (
          <DelayedNumericInput
            value={lossValue}
            onChange={value => onCustomLossValueChange(customValueKey, attribute, value)}
          />
        )}
        {explain(unit, attribute)}
      </PaddedRow>
    )
  }
}
