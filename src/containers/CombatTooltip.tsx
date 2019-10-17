import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Popup, List } from 'semantic-ui-react'
import { last } from 'lodash'

import StyledNumber from '../components/Utils/StyledNumber'

import { AppState } from '../store/'
import { Side, Units } from '../store/battle'
import { getArmyBySide, getCurrentUnits, getParticipant, getSettings, getSelectedTerrains, getPreviousUnits } from '../store/utils'

import { calculateValue, calculateValueWithoutLoss, strengthToValue } from '../base_definition'
import { toManpower, toNumber, toSignedPercent } from '../formatters'
import { UnitCalc, Unit, UnitType } from '../store/units'
import { calculateTotalRoll, calculateBaseDamage, calculateTactic, calculateExperienceReduction, calculateTotalDamage, calculateStrengthDamage, calculateMoraleDamage } from '../store/combat'
import { TerrainType } from '../store/terrains'
import { CombatParameter } from '../store/settings'
import { TacticCalc } from '../store/tactics'

interface Props {
  index: number | null
  context: Element | null
  side: Side
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
    const { index, context } = this.props
    return (
      <Popup
        open={index != null}
        context={context!}
        content={this.getExplanation(index)}
        inverted
      />
    )
  }

  BLUE = 'value-blue'
  ORANGE = 'value-orange'
  RED = 'value-red'

  getExplanation = (index: number | null) => {
    if (index === null)
      return null
    const current = this.findUnit(this.props.current_s, index)
    if (!current)
      return null
    const source = this.findUnit(this.props.units_s, current.id)
    if (!source)
      return null
    const { roll, side, settings, terrains, general_s, general_t, units_s, tactic_s, tactic_t } = this.props
    const target = current.target ? this.props.units_t.frontline[current.target] : null
    const total = calculateTotalRoll(roll, side === Side.Attacker ? terrains : [], general_s, general_t)
    const base_damage = calculateBaseDamage(total, settings)
    const tactic_damage = calculateTactic(units_s, tactic_s, tactic_t.type)
    const total_damage = target ? calculateTotalDamage(settings, base_damage, source, target, terrains, tactic_damage) : 0
    return (
      <List>
        {this.getInfoSection(source, current, target)}
        {target && <List.Item />}
        {target && this.getBaseSection(source, target, base_damage, tactic_damage, total_damage)}
        {target && <List.Item />}
        {target && this.getStrengthSection(source, target, total_damage)}
        {target && <List.Item />}
        {target && this.getMoraleSection(source, target, total_damage)}
      </List>
    )
  }

  getBaseSection = (source: Unit, target: Unit, base_damage: number, tactic_damage: number, total_damage: number) => {
    const { settings, terrains } = this.props
    const terrain_types = terrains.map(value => value.type)
    const strength = calculateValue(source, UnitCalc.Strength)
    const offense_vs_defense = calculateValue(source, UnitCalc.Offense) - calculateValue(target, UnitCalc.Defense)
    const experience_reduction = calculateExperienceReduction(settings, target)
    const target_type = calculateValue(source, target.type)

    const attributes: (UnitCalc | UnitType)[] = [UnitCalc.Discipline, UnitCalc.DamageDone]
    if (!settings[CombatParameter.FixDamageTaken])
      attributes.push(UnitCalc.DamageDone)
    const target_attributes: (UnitCalc | UnitType)[] = []
    if (settings[CombatParameter.FixDamageTaken])
      target_attributes.push(UnitCalc.DamageTaken)

    return (<>
      {this.renderItem('Base damage', base_damage, toNumber)}
      {this.renderStyledItem('Tactic', tactic_damage, toSignedPercent)}
      {attributes.map(attribute => this.getAttribute(source, attribute))}
      {this.renderStyledItem(target.type, target_type, toSignedPercent)}
      {this.renderStyledItem('Offense vs Defense', offense_vs_defense, toSignedPercent)}
      {this.renderStyledItem('Target experience', experience_reduction, toSignedPercent)}
      {target_attributes.map(terrain => this.getAttribute(target, terrain))}
      {terrain_types.map(terrain => this.getAttribute(source, terrain))}
      {this.renderMultiplier('Unit strength', strength, toNumber)}
      {this.renderItem('Total damage', total_damage, toNumber)}
    </>)
  }

  getStrengthSection = (source: Unit, target: Unit, total_damage: number) => {
    const { settings, tactic_s, tactic_t } = this.props
    const strength_lost_multiplier =  1000 * settings[CombatParameter.StrengthLostMultiplier]
    const tactic_casualties = calculateValue(tactic_s, TacticCalc.Casualties) + calculateValue(tactic_t, TacticCalc.Casualties)

    const strength_damage = calculateStrengthDamage(settings, total_damage, source, target, tactic_casualties)

    return (<>
      {this.renderMultiplier('Constant', strength_lost_multiplier, String)}
      {this.renderStyledItem('Tactic casualties', tactic_casualties, toSignedPercent)}
      {this.getAttribute(source, UnitCalc.StrengthDamageDone)}
      {this.getAttribute(target, UnitCalc.StrengthDamageTaken)}
      {this.renderItem('Strength damage', strength_damage, toManpower)}
    </>)
  }

  getMoraleSection = (source: Unit, target: Unit, total_damage: number) => {
    const { settings } = this.props
    const morale_lost_multiplier = settings[CombatParameter.MoraleLostMultiplier] / settings[CombatParameter.MoraleDamageBase]
    const morale = calculateValue(source, UnitCalc.Morale)
    const strength_damage = calculateMoraleDamage(settings, total_damage, source, target)

    return (<>
      {this.renderMultiplier('Constant', morale_lost_multiplier, String)}
      {this.getAttribute(source, UnitCalc.MoraleDamageDone)}
      {this.getAttribute(target, UnitCalc.MoraleDamageTaken)}
      {this.renderMultiplier('Unit morale', morale, toNumber)}
      {this.renderItem('Morale damage', strength_damage, toNumber)}
    </>)
  }

  getAttribute = (unit: Unit, attribute: UnitCalc | UnitType | TerrainType) => (
    this.renderStyledItem(attribute, calculateValue(unit, attribute), toSignedPercent)
  )

  getInfoSection = (unit: Unit, current: Unit, target: Unit | null) => {
    const { mode } = this.props
    const morale = calculateValue(unit, UnitCalc.Morale)
    const morale_current = calculateValue(current, UnitCalc.Morale)
    const moraleMax = calculateValueWithoutLoss(unit, UnitCalc.Morale)
    const morale_loss = morale_current - morale
    const strength = calculateValue(unit, UnitCalc.Strength)
    const strength_current = calculateValue(current, UnitCalc.Strength)
    const strength_loss = strength_current - strength
    return (<>
      <List.Item>
        {unit.type}
        {' '}
        {unit.id}
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
        <span className={this.ORANGE}>{target ? target.type + ' ' + target.id : 'No target'}</span>
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
    if (!value)
      return null
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

  findUnit = (participant: Units, id: number): Unit | null => {
    let unit = participant.reserve.find(unit => unit.id === id) || null
    if (unit)
      return unit
    unit = participant.frontline.find(unit => unit ? unit.id === id : false) || null
    if (unit)
      return unit
    unit = participant.defeated.find(unit => unit.id === id) || null
    if (unit)
      return unit
    return null
  }

}

const mapStateToProps = (state: AppState, props: Props) => ({
  units_s: getPreviousUnits(state, props.side),
  current_s: getCurrentUnits(state, props.side),
  units_t: getCurrentUnits(state, props.side === Side.Attacker ? Side.Defender : Side.Attacker),
  roll: (last(getParticipant(state, props.side).rolls) || { roll: 0 }).roll,
  settings: getSettings(state),
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
