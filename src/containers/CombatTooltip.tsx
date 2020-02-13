import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Popup, List } from 'semantic-ui-react'
import { last } from 'lodash'

import StyledNumber from 'components/Utils/StyledNumber'

import { Mode, Side, ArmyType, UnitAttribute, UnitType, Setting, TacticCalc, TerrainType, Cohort } from 'types'
import { calculateTotalRoll, calculateBaseDamage, CombatUnitDefinition, CombatUnitRoundInfo, CombatUnit } from 'combat'
import { toSignedPercent, toManpower, strengthToValue, toNumber } from 'formatters'
import { calculateValue, calculateBase, calculateModifier } from 'definition_values'
import { AppState, getCurrentCombat, getParticipant, getSettings, getSelectedTerrains, getGeneralStats, getCountry, getTactic, getCombatUnit, findCohortById } from 'state'
import { getOpponent } from 'army_utils'

type Props = {
  id: number | null
  is_support: boolean
  context: Element | null
  side: Side
  army: ArmyType
}

type IState = {
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
    const { id, context, is_support } = this.props
    return (
      <Popup
        open={id != null}
        context={context!}
        content={this.getExplanation(id, is_support)}
        inverted
      />
    )
  }

  BLUE = 'color-blue'
  ORANGE = 'color-orange'
  RED = 'color-red'

  getExplanation = (id: number | null, is_support: boolean) => {
    if (id === null)
      return null
    const { source, tactic_bonus, roll, side, settings, terrains, general_s, general_t, cohort } = this.props
    if (!source || !cohort)
      return null
    const target = source.target
    const total = calculateTotalRoll(roll, side === Side.Attacker ? terrains : [], general_s, general_t)
    const base_damage = calculateBaseDamage(total, settings)
    return (
      <List>
        {this.getInfoSection(source, target)}
        {target && <List.Item />}
        {target && this.getBaseSection(source, target, base_damage, tactic_bonus, is_support)}
        {target && <List.Item />}
        {target && this.getStrengthSection(source, cohort, target)}
        {target && <List.Item />}
        {target && this.getMoraleSection(source, target)}
      </List>
    )
  }

  toNumber = (value: number) => toNumber(value, 3)

  getBaseSection = (source: IUnit, target: IUnit, base_damage: number, tactic_damage: number, is_support: boolean) => {
    const { terrains, settings } = this.props
    const terrain_types = terrains.map(value => value.type)
    const strength = source[UnitAttribute.Strength] + source.strength_loss
    const offense_vs_defense = source[UnitAttribute.Offense] - target[UnitAttribute.Defense]
    const experience_reduction = target.experience_reduction
    const target_type = source[target.type]
    const is_loyal = source.is_loyal
    const total_damage = source.damage_dealt

    const attributes: (UnitAttribute | UnitType)[] = [UnitAttribute.Discipline, UnitAttribute.DamageDone]
    const target_attributes: (UnitAttribute | UnitType)[] = [UnitAttribute.DamageTaken]

    return (<>
      {this.renderItem('Base damage', base_damage, this.toNumber)}
      {this.renderStyledItem('Tactic', tactic_damage, toSignedPercent)}
      {this.renderStyledItem('Loyal', is_loyal ? 0.1 : 0, toSignedPercent)}
      {attributes.map(attribute => this.getAttribute(source, attribute))}
      {this.renderStyledItem(target.type, target_type, toSignedPercent)}
      {this.renderStyledItem('Offense vs Defense', offense_vs_defense, toSignedPercent)}
      {settings[Setting.DisciplineDamageReduction] && this.renderStyledItem('Target discipline', 1/(target[UnitAttribute.Discipline] + 1) - 1, toSignedPercent)}
      {this.renderStyledItem('Target experience', experience_reduction, toSignedPercent)}
      {target_attributes.map(terrain => this.getAttribute(target, terrain))}
      {terrain_types.map(terrain => this.getAttribute(source, terrain))}
      {is_support && this.renderStyledItem(UnitAttribute.BackrowEffectiveness, source[UnitAttribute.BackrowEffectiveness] - 1, toSignedPercent)}
      {this.renderMultiplier('Unit strength', strength, toNumber)}
      {this.renderItem('Total damage', total_damage, this.toNumber)}
    </>)
  }

  getStrengthSection = (source: IUnit, cohort: Cohort, target: IUnit) => {
    const { settings, tactic_s, tactic_t, mode, phase } = this.props
    const strength_lost_multiplier = settings[Setting.StrengthLostMultiplier]
    const tactic_casualties = calculateValue(tactic_s, TacticCalc.Casualties) + calculateValue(tactic_t, TacticCalc.Casualties)
    const base_phase = calculateBase(cohort, phase)
    const modifier_phase = calculateModifier(cohort, phase) - 1
    const strength_damage = source.strength_dealt

    return (<>
      {this.renderMultiplier('Constant', strength_lost_multiplier, value => mode === Mode.Land ? toManpower(value) : String(value))}
      {settings[Setting.FireAndShock] && this.renderMultiplier('Base ' + phase, base_phase, String)}
      {this.renderStyledItem('Tactic casualties', tactic_casualties, toSignedPercent)}
      {this.renderStyledItem(phase, modifier_phase, toSignedPercent)}
      {this.getAttribute(source, UnitAttribute.StrengthDamageDone)}
      {this.getAttribute(target, UnitAttribute.StrengthDamageTaken)}
      {this.renderItem('Strength damage', strength_damage, value => strengthToValue(mode, value))}
    </>)
  }

  getMoraleSection = (source: IUnit, target: IUnit) => {
    const { settings } = this.props
    const morale_lost_multiplier = settings[Setting.MoraleLostMultiplier]
    const morale = source[UnitAttribute.Morale] + source.morale_loss
    const morale_damage = source.morale_dealt

    return (<>
      {this.renderMultiplier('Constant', morale_lost_multiplier, String)}
      {this.getAttribute(source, UnitAttribute.MoraleDamageDone)}
      {this.getAttribute(target, UnitAttribute.MoraleDamageTaken)}
      {this.renderMultiplier('Unit morale', morale, toNumber)}
      {this.renderItem('Morale damage', morale_damage, this.toNumber)}
    </>)
  }

  getAttribute = (unit: IUnit, attribute: UnitAttribute | UnitType | TerrainType) => (
    this.renderStyledItem(attribute, unit[attribute], toSignedPercent)
  )

  getInfoSection = (source: IUnit, target: IUnit | null) => {
    const { mode } = this.props
    const morale_current = source[UnitAttribute.Morale]
    const moraleMax = source.max_morale
    const morale_loss = -source.morale_loss
    const strength_current = source[UnitAttribute.Strength]
    const strength_loss = -source.strength_loss
    return (<>
      <List.Item>
        {source.type}
        {' '}
        {source.id}
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
              <StyledNumber value={morale_loss} formatter={this.toNumber} negative_color={this.RED} />
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
      <List.Item key={label}>
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
}


interface IUnit extends CombatUnitDefinition, Omit<CombatUnitRoundInfo, 'target'> {
  target: IUnit | null
}

const convertUnit = (unit: CombatUnit | null, convert_target: boolean = true): IUnit | null => {
  if (!unit)
    return null
  return {
    ...unit.definition,
    ...unit.state,
    ...unit,
    target: convert_target ? convertUnit(unit.state.target, false) : null
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  source: convertUnit(getCombatUnit(state, props.side, props.army, props.id)),
  cohort: findCohortById(state, props.side, props.id!),
  tactic_bonus: getCurrentCombat(state, props.side).tactic_bonus,
  phase: getCurrentCombat(state, props.side).phase,
  roll: (last(getParticipant(state, props.side).rolls) || { roll: 0 }).roll,
  settings: getSettings(state),
  terrains: getSelectedTerrains(state),
  general_s: getGeneralStats(state, getCountry(state, props.side)).martial,
  tactic_s: getTactic(state, props.side),
  general_t: getGeneralStats(state, getCountry(state, getOpponent(props.side))).martial,
  tactic_t: getTactic(state, getOpponent(props.side)),
  mode: state.settings.mode
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(CombatTooltip)
