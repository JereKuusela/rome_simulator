import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'

import PaddedRow from './Utils/PaddedRow'
import DetailToggleRow from './Detail/DetailToggleRow'
import DetailTextRow from './Detail/DetailTextRow'
import DetailInputRow from './Detail/DetailInputRow'
import DetailDropdownRow from './Detail/DetailDropdownRow'
import Headers from './Utils/Headers'
import { Mode, ValuesType, CohortDefinition, UnitType, TerrainType, UnitRole, UnitAttribute, UnitValueType, unitValueToString, Setting, CombatPhase, isAttributeEnabled, SiteSettings } from 'types'
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
  disableBaseValues?: boolean
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
    const id = 'test'
    return (
      <Table celled selectable unstackable>
        <Headers values={this.headers} />
        <Table.Body>
          {id && <DetailTextRow text='Identifier' cells={this.CELLS} value={id} />}
          {onTypeChange && unitTypes && unitTypesAsDropdown && <DetailDropdownRow text='Type' cells={this.CELLS} value={type} values={unitTypes} onChange={onTypeChange} />}
          {onTypeChange && unitTypes && !unitTypesAsDropdown && <DetailInputRow text='Name' cells={this.CELLS} value={type} onChange={onTypeChange} />}
          {mode && <DetailTextRow text='Mode' cells={this.CELLS} value={mode} />}
          {settings[Setting.Culture] && culture && <DetailTextRow text='Culture' cells={this.CELLS} value={culture} />}
          {settings[Setting.Tech] && tech && <DetailTextRow text='Tech' cells={this.CELLS} value={tech} />}
          {parent && unitTypesWithParent && onParentChange && <DetailDropdownRow text='Parent' cells={this.CELLS} value={parent} values={unitTypesWithParent} onChange={onParentChange} />}
          {onImageChange && <DetailInputRow text='Image' cells={this.CELLS} value={image} onChange={onImageChange} />}
          {onChangeDeployment && role && <DetailDropdownRow text='Deployment' cells={this.CELLS} value={role} values={this.deployments} onChange={onChangeDeployment} />}
          {settings[Setting.AttributeLoyal] && <DetailToggleRow text='Is loyal?' cells={this.CELLS} value={!!isLoyal} onChange={onIsLoyalToggle} />}
          {this.attributes.map(this.renderRow)}
          {settings[Setting.AttributeUnitType] && unitTypes && unitTypes.map(this.renderRow)}
          {settings[Setting.AttributeTerrainType] && terrainTypes && terrainTypes.map(this.renderRow)}
          {[CombatPhase.Fire, CombatPhase.Shock].map(this.renderRow)}
        </Table.Body>
      </Table>
    )
  }

  renderRow = (attribute: UnitValueType) => {
    const { unit, customValueKey, onCustomBaseValueChange, onCustomModifierValueChange, onCustomLossModifierValueChange: onCustomLossValueChange, disableBaseValues, settings, mode, showStatistics } = this.props
    if (!isAttributeEnabled(attribute, settings, mode, showStatistics))
      return null
    const baseValue = getValue(ValuesType.Base, unit, attribute, customValueKey)
    const modifierValue = getValue(ValuesType.Modifier, unit, attribute, customValueKey)
    const lossValue = getValue(ValuesType.LossModifier, unit, attribute, customValueKey)
    let value = unitValueToString(unit, attribute)
    if (attribute === UnitAttribute.Maintenance)
      value += ' (' + toMaintenance(calculateValue(unit, UnitAttribute.Cost) * calculateValue(unit, UnitAttribute.Maintenance)) + ')'

    const enableLoss = attribute === UnitAttribute.Morale || attribute === UnitAttribute.Strength
    const enableModifier = enableLoss || attribute === UnitAttribute.Maintenance || attribute === UnitAttribute.Cost || attribute === UnitAttribute.AttritionWeight
    const enableBase = !disableBaseValues || !enableModifier

    return (
      <PaddedRow key={attribute} cells={this.CELLS}>
        {attribute}
        {value}
        {enableBase && <DelayedNumericInput value={baseValue} onChange={value => onCustomBaseValueChange(customValueKey, attribute, value)} />}
        {enableModifier && <DelayedNumericInput value={modifierValue} onChange={value => onCustomModifierValueChange(customValueKey, attribute, value)} />}
        {enableLoss && <DelayedNumericInput value={lossValue} onChange={value => onCustomLossValueChange(customValueKey, attribute, value)} />}
        {explain(unit, attribute)}
      </PaddedRow>
    )
  }
}
