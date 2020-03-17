import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Popup, List } from 'semantic-ui-react'

import StyledNumber from 'components/Utils/StyledNumber'

import { Mode, Side, ArmyType, UnitAttribute, UnitType, Setting, TacticCalc, TerrainType, CombatPhase } from 'types'
import { CombatCohort, CombatCohortRoundInfo, CombatCohortDefinition, calculateCohortPips, calculateBaseDamage, getOffensiveCohortPips, getDefensiveCohortPips, getCombatPhase, getDailyIncrease, getDefensiveSupportCohortPips } from 'combat'
import { toSignedPercent, toManpower, strengthToValue, toNumber, addSign, toMultiplier } from 'formatters'
import { calculateValue } from 'definition_values'
import { AppState, getSettings, getSelectedTerrains, getTactic, getCombatUnit, getCombatParticipant } from 'state'
import { getOpponent } from 'army_utils'
import { noZero } from 'utils'

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
    const { source } = this.props
    if (!source)
      return null

    const target = source.target
    const target_support = source.target_support
    return (
      <List>
        {this.getInfoSection(source, target)}
        {target && <List.Item />}
        {target && this.getBaseDamageSection(source, target, target_support)}
        {target && <List.Item />}
        {target && this.getDamageMultiplierSection(source, target, is_support)}
        {target && <List.Item />}
        {target && this.getStrengthSection(source, target)}
        {target && <List.Item />}
        {target && this.getMoraleSection(source, target)}
      </List>
    )
  }

  toNumber = (value: number) => toNumber(value, 3)
  toAdd = (value: number) => value ? addSign(Number(this.toNumber(value))) : null
  toMultiplier = (value: number) => toMultiplier(value, 3)

  getBaseDamageSection = (source: IUnit, target: IUnit, target_support: IUnit | null) => {
    const { participant, settings } = this.props
    const { round } = participant
    const phase = getCombatPhase(round, settings)
    const phase_roll = calculateCohortPips(source, target, target_support, UnitAttribute.Strength, phase)
    const morale_roll = calculateCohortPips(source, target, target_support, UnitAttribute.Morale)
    const multi = phase_roll || morale_roll

    if (multi) {
      return (<>
        {this.getBaseDamageSubSection(source, target, target_support, UnitAttribute.Strength, phase)}
        {<List.Item />}
        {this.getBaseDamageSubSection(source, target, target_support, UnitAttribute.Morale, phase)}
      </>)
    }
    return (<>
      {this.getBaseDamageSubSection(source, target, target_support, '', phase)}
    </>)
  }

  getBaseDamageSubSection = (source: IUnit, target: IUnit, target_support: IUnit | null, type: UnitAttribute.Strength | UnitAttribute.Morale | '', phase: CombatPhase) => {
    const { settings, participant } = this.props
    const { dice, terrain_pips, general_pips } = participant
    const base_pips = settings[Setting.BaseRoll]
    const source_pips = type ? getOffensiveCohortPips(source, type, phase) : 0
    const target_pips = type ? getDefensiveCohortPips(target, type, phase) : 0
    const target_support_pips = type ? getDefensiveSupportCohortPips(target_support, type, phase) : 0
    const total_pips = dice + terrain_pips + general_pips[phase] + source_pips + target_pips + target_support_pips
    const text = type === UnitAttribute.Morale ? UnitAttribute.Morale : phase
    return (<>
      {this.renderModifier('Base pips', base_pips, this.toAdd)}
      {this.renderModifier('Dice pips', dice, this.toAdd)}
      {this.renderModifier('Terrain pips', terrain_pips, this.toAdd)}
      {this.renderModifier('General pips', general_pips[phase], this.toAdd)}
      {this.renderModifier(text + ' pips', source_pips, this.toAdd)}
      {this.renderModifier('Enemy ' + text.toLowerCase() + ' pips', target_pips, this.toAdd)}
      {this.renderModifier('Backrow ' + text.toLowerCase() + ' pips', target_support_pips, this.toAdd)}
      {this.renderModifier('Roll damage', settings[Setting.RollDamage], this.toMultiplier)}
      {this.renderItem('Base ' + type.toLowerCase() + ' damage', calculateBaseDamage(total_pips, settings), this.toNumber)}
    </>)
  }

  getDamageMultiplierSection = (source: IUnit, target: IUnit, is_support: boolean) => {
    const { terrains, settings, participant } = this.props
    const { round, tactic_bonus, flank_ratio_bonus } = participant
    const phase = getCombatPhase(round, settings)
    const daily_damage = getDailyIncrease(round, settings)
    const terrain_types = settings[Setting.AttributeTerrainType] ? terrains.map(value => value.type) : []
    const strength = source[UnitAttribute.Strength] + source.strength_loss
    const offense_vs_defense = settings[Setting.AttributeOffenseDefense] ? source[UnitAttribute.Offense] - target[UnitAttribute.Defense] : 0
    const experience_reduction = settings[Setting.AttributeExperience] ? target.experience_reduction : 0
    const target_type = settings[Setting.AttributeUnitType] ? source[target.type] : 0
    const is_loyal = source.is_loyal
    const multiplier = source.damage_multiplier

    return (<>
      {this.renderStyledItem('Tactic', tactic_bonus, toSignedPercent)}
      {this.renderStyledItem('Enemy insufficient support', flank_ratio_bonus, toSignedPercent)}
      {this.renderStyledItem('Loyal', is_loyal ? 0.1 : 0, toSignedPercent)}
      {this.getAttribute(source, UnitAttribute.Discipline)}
      {settings[Setting.AttributeDamage] && this.getAttribute(source, UnitAttribute.DamageDone)}
      {settings[Setting.AttributeCombatAbility] && this.getAttribute(source, UnitAttribute.CombatAbility)}
      {this.renderStyledItem(target.type, target_type, toSignedPercent)}
      {this.renderStyledItem('Offense vs Defense', offense_vs_defense, toSignedPercent)}
      {settings[Setting.DisciplineDamageReduction] && this.renderStyledItem('Target discipline', 1 / noZero(target[UnitAttribute.Discipline] + 1) - 1, toSignedPercent)}
      {this.renderStyledItem('Enemy experience', experience_reduction, toSignedPercent)}
      {settings[Setting.AttributeDamage] && this.getAttribute(target, UnitAttribute.DamageTaken)}
      {terrain_types.map(terrain => this.getAttribute(source, terrain))}
      {is_support && this.renderStyledItem(UnitAttribute.OffensiveSupport, source[UnitAttribute.OffensiveSupport] - 1, toSignedPercent)}
      {this.renderStyledItem('Battle length', daily_damage, toSignedPercent)}
      {settings[Setting.FireAndShock] && this.renderModifier(phase, source[phase], this.toMultiplier)}
      {settings[Setting.AttributeMilitaryTactics] && this.renderModifier('Target military tactics', 1 / noZero(target[UnitAttribute.MilitaryTactics]), this.toMultiplier)}
      {this.renderModifier('Unit strength', strength, this.toMultiplier)}
      {this.renderItem('Damage multiplier', multiplier, this.toMultiplier)}
    </>)
  }

  getStrengthSection = (source: IUnit, target: IUnit) => {
    const { settings, tactic_s, tactic_t, mode, participant } = this.props
    const { round } = participant
    const phase = getCombatPhase(round, settings)
    const strength_lost_multiplier = settings[Setting.StrengthLostMultiplier]
    const tactic_casualties = calculateValue(tactic_s, TacticCalc.Casualties) + calculateValue(tactic_t, TacticCalc.Casualties)
    const strength_damage = source.strength_dealt

    return (<>
      {this.renderModifier('Constant', strength_lost_multiplier, value => mode === Mode.Land ? this.toMultiplier(Number(toManpower(value))) : this.toMultiplier(value))}
      {this.renderStyledItem('Tactic casualties', tactic_casualties, toSignedPercent)}
      {settings[Setting.FireAndShock] && this.getAttribute(source, phase === CombatPhase.Shock ? UnitAttribute.ShockDamageDone : UnitAttribute.FireDamageDone)}
      {settings[Setting.FireAndShock] && this.getAttribute(target, phase === CombatPhase.Shock ? UnitAttribute.ShockDamageTaken : UnitAttribute.FireDamageTaken)}
      {settings[Setting.AttributeStrengthDamage] && this.getAttribute(source, UnitAttribute.StrengthDamageDone)}
      {settings[Setting.AttributeStrengthDamage] && this.getAttribute(target, UnitAttribute.StrengthDamageTaken)}
      {this.renderItem('Strength damage', strength_damage, value => strengthToValue(mode, value))}
    </>)
  }

  getMoraleSection = (source: IUnit, target: IUnit) => {
    const { settings } = this.props
    const morale_lost_multiplier = settings[Setting.MoraleLostMultiplier]
    const morale = settings[Setting.UseMaxMorale] ? source.max_morale : (source[UnitAttribute.Morale] + source.morale_loss)
    const morale_str = settings[Setting.UseMaxMorale] ? 'Unit max morale' : 'Unit morale'
    const morale_damage = source.morale_dealt

    return (<>
      {this.renderModifier('Constant', morale_lost_multiplier, this.toMultiplier)}
      {settings[Setting.AttributeMoraleDamage] && this.getAttribute(source, UnitAttribute.MoraleDamageDone)}
      {settings[Setting.AttributeMoraleDamage] && this.getAttribute(target, UnitAttribute.MoraleDamageTaken)}
      {this.renderModifier(morale_str, morale, this.toMultiplier)}
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

  renderModifier = (label: string, value: number, formatter: (value: number) => string | null) => {
    const str = formatter(value)
    if (!str)
      return null
    return (
      <List.Item>
        {label}
        {': '}
        <span className={this.BLUE}>{str}</span>
      </List.Item>
    )
  }
}


interface IUnit extends CombatCohortDefinition, Omit<CombatCohortRoundInfo, 'target' | 'target_support'> {
  target: IUnit | null
  target_support: IUnit | null
}

const convertUnit = (cohort: CombatCohort | null, convert_target: boolean = true): IUnit | null => {
  if (!cohort)
    return null
  return {
    ...cohort.definition,
    ...cohort.state,
    ...cohort,
    target: convert_target ? convertUnit(cohort.state.target, false) : null,
    target_support: convert_target && cohort.state.target_support ? convertUnit(cohort.state.target_support, false) : null
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  source: convertUnit(getCombatUnit(state, props.side, props.army, props.id)),
  participant: getCombatParticipant(state, props.side),
  settings: getSettings(state),
  terrains: getSelectedTerrains(state),
  tactic_s: getTactic(state, props.side),
  tactic_t: getTactic(state, getOpponent(props.side)),
  mode: state.settings.mode
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(CombatTooltip)
