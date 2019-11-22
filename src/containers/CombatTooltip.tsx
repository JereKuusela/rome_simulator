import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Popup, List } from 'semantic-ui-react'
import { last } from 'lodash'

import StyledNumber from '../components/Utils/StyledNumber'

import { AppState } from '../store/'
import { Side, ArmyType } from '../store/battle'
import { getArmyBySide, getParticipant, getCombatSettings, getSelectedTerrains, getCurrentCombat } from '../store/utils'

import { calculateValue, strengthToValue, DefinitionType } from '../base_definition'
import { toNumber, toSignedPercent, toManpower } from '../formatters'
import { UnitCalc, UnitType } from '../store/units'
import { TerrainType } from '../store/terrains'
import { CombatParameter } from '../store/settings'
import { TacticCalc } from '../store/tactics'
import { calculateTotalRoll, calculateBaseDamage } from '../combat/combat'
import { CombatUnits, CombatUnit } from '../combat/combat_fast'

interface Props {
  id: number | null
  context: Element | null
  side: Side
  army: ArmyType
}

interface IState {
  content: JSX.Element | null
}

/**
 * Displays a combat tooltip for the unit at a given index.
 * The tooltip shows strength, morale, target and damage breakdown.
 */
class CombatTooltip extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { content: null }
  }

  render() {
    const { id, context } = this.props
    return (
      <Popup
        open={id != null}
        context={context!}
        content={this.getExplanation(id)}
        inverted
      />
    )
  }

  BLUE = 'color-blue'
  ORANGE = 'color-orange'
  RED = 'color-red'

  getExplanation = (id: number | null) => {
    if (id === null)
      return null
    const { army, units, roll, side, settings, terrains, general_s, general_t } = this.props
    const source = this.findUnit(this.getArmy(units, army), id)
    if (!source)
      return null
    const target = source.state.target
    const total = calculateTotalRoll(roll, side === Side.Attacker ? terrains : [], general_s, general_t)
    const base_damage = calculateBaseDamage(total, settings)
    const tactic_damage = units.tactic_bonus
    return (
      <List>
        {this.getInfoSection(source, target)}
        {target && <List.Item />}
        {target && this.getBaseSection(source, target, base_damage, tactic_damage)}
        {target && <List.Item />}
        {target && this.getStrengthSection(source, target)}
        {target && <List.Item />}
        {target && this.getMoraleSection(source, target)}
      </List>
    )
  }

  getBaseSection = (source: CombatUnit, target: CombatUnit, base_damage: number, tactic_damage: number) => {
    const { settings, terrains } = this.props
    const terrain_types = terrains.map(value => value.type)
    const strength = source[UnitCalc.Strength] + source.state.strength_loss
    const offense_vs_defense = source.definition[UnitCalc.Offense] - target.definition[UnitCalc.Defense]
    const experience_reduction = target.definition.experience_reduction
    const target_type = source.definition[target.definition.type]
    const is_loyal = source.definition.is_loyal
    const total_damage = source.state.damage_dealt

    const attributes: (UnitCalc | UnitType)[] = [UnitCalc.Discipline, UnitCalc.DamageDone]
    if (!settings[CombatParameter.FixDamageTaken])
      attributes.push(UnitCalc.DamageDone)
    const target_attributes: (UnitCalc | UnitType)[] = []
    if (settings[CombatParameter.FixDamageTaken])
      target_attributes.push(UnitCalc.DamageTaken)

    return (<>
      {this.renderItem('Base damage', base_damage, toNumber)}
      {this.renderStyledItem('Tactic', tactic_damage, toSignedPercent)}
      {this.renderStyledItem('Loyal', is_loyal ? 0.1 : 0, toSignedPercent)}
      {attributes.map(attribute => this.getAttribute(source, attribute))}
      {this.renderStyledItem(target.definition.type, target_type, toSignedPercent)}
      {this.renderStyledItem('Offense vs Defense', offense_vs_defense, toSignedPercent)}
      {this.renderStyledItem('Target experience', experience_reduction, toSignedPercent)}
      {target_attributes.map(terrain => this.getAttribute(target, terrain))}
      {terrain_types.map(terrain => this.getAttribute(source, terrain))}
      {this.renderMultiplier('Unit strength', strength, toNumber)}
      {this.renderItem('Total damage', total_damage, toNumber)}
    </>)
  }

  getStrengthSection = (source: CombatUnit, target: CombatUnit) => {
    const { settings, tactic_s, tactic_t, mode } = this.props
    const strength_lost_multiplier = settings[CombatParameter.StrengthLostMultiplier]
    const tactic_casualties = calculateValue(tactic_s, TacticCalc.Casualties) + calculateValue(tactic_t, TacticCalc.Casualties)

    const strength_damage = source.state.strength_dealt

    return (<>
      {this.renderMultiplier('Constant', strength_lost_multiplier, value => mode === DefinitionType.Land ? toManpower(value) : String(value))}
      {this.renderStyledItem('Tactic casualties', tactic_casualties, toSignedPercent)}
      {this.getAttribute(source, UnitCalc.StrengthDamageDone)}
      {this.getAttribute(target, UnitCalc.StrengthDamageTaken)}
      {this.renderItem('Strength damage', strength_damage, value => strengthToValue(mode, value))}
    </>)
  }

  getMoraleSection = (source: CombatUnit, target: CombatUnit) => {
    const { settings } = this.props
    const morale_lost_multiplier = settings[CombatParameter.MoraleLostMultiplier] / settings[CombatParameter.MoraleDamageBase]
    const morale = source[UnitCalc.Morale] + source.state.morale_loss
    const morale_damage = source.state.morale_dealt

    return (<>
      {this.renderMultiplier('Constant', morale_lost_multiplier, String)}
      {this.getAttribute(source, UnitCalc.MoraleDamageDone)}
      {this.getAttribute(target, UnitCalc.MoraleDamageTaken)}
      {this.renderMultiplier('Unit morale', morale, toNumber)}
      {this.renderItem('Morale damage', morale_damage, toNumber)}
    </>)
  }

  getAttribute = (unit: CombatUnit, attribute: UnitCalc | UnitType | TerrainType) => (
    this.renderStyledItem(attribute, unit.definition[attribute], toSignedPercent)
  )

  getInfoSection = (source: CombatUnit, target: CombatUnit | null) => {
    const { mode } = this.props
    const morale_current = source[UnitCalc.Morale]
    const moraleMax = source.definition.max_morale
    const morale_loss = -source.state.morale_loss
    const strength_current = source[UnitCalc.Strength]
    const strength_loss = -source.state.strength_loss
    return (<>
      <List.Item>
        {source.definition.type}
        {' '}
        {source.definition.id}
      </List.Item>
      <List.Item>
        {'Strength: '}
        <span className={this.ORANGE}>{strengthToValue(mode, strength_current)}</span>
        {
          strength_loss ?
            <>
              {' ('}
              <StyledNumber value={strength_loss} formatter={value => strengthToValue(mode, value)} negative_color={this.RED} />
              {')'}
            </>
            : null
        }

      </List.Item>
      <List.Item>
        {'Morale: '}
        <span className={this.ORANGE}>{toNumber(morale_current) + ' / ' + toNumber(moraleMax)}</span>
        {
          morale_loss ?
            <>
              {' ('}
              <StyledNumber value={morale_loss} formatter={toNumber} negative_color={this.RED} />
              {')'}
            </>
            : null
        }
      </List.Item>
      <List.Item>
        {'Target: '}
        <span className={this.ORANGE}>{target ? target.definition.type + ' ' + target.definition.id : 'No target'}</span>
      </List.Item>
    </>)
  }

  renderStyledItem = (label: string, value: number, formatter: (value: number) => string) => {
    if (!value)
      return null
    return (
      <List.Item>
        {label}
        {': '}
        <StyledNumber value={value} formatter={formatter} negative_color={this.RED} />
      </List.Item>
    )
  }

  renderItem = (label: string, value: number, formatter: (value: number) => string) => {
    return (
      <List.Item>
        {label}
        {': '}
        <span className={this.ORANGE}>{formatter(value)}</span>
      </List.Item>
    )
  }

  renderMultiplier = (label: string, value: number, formatter: (value: number) => string) => {
    if (!value)
      return null
    return (
      <List.Item>
        {label}
        {': '}
        <span className={this.BLUE}>{'x' + formatter(value)}</span>
      </List.Item>
    )
  }

  getArmy = (units: CombatUnits, army: ArmyType) => {
    if (army === ArmyType.Frontline)
      return units.frontline
    if (army === ArmyType.Reserve)
      return units.reserve
    return units.defeated
  }

  findUnit = (units: (CombatUnit | null)[], id: number): CombatUnit | null => (
    units.find(unit => unit ? unit.definition.id === id : false) ?? null
  )

}

const mapStateToProps = (state: AppState, props: Props) => ({
  units: getCurrentCombat(state, props.side),
  roll: (last(getParticipant(state, props.side).rolls) || { roll: 0 }).roll,
  settings: getCombatSettings(state),
  terrains: getSelectedTerrains(state),
  general_s: getArmyBySide(state, props.side).general.total,
  tactic_s: state.tactics[getArmyBySide(state, props.side).tactic],
  general_t: getArmyBySide(state, props.side === Side.Attacker ? Side.Defender : Side.Attacker).general.total,
  tactic_t: state.tactics[getArmyBySide(state, props.side === Side.Attacker ? Side.Defender : Side.Attacker).tactic],
  mode: state.settings.mode
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(CombatTooltip)
