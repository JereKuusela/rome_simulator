import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Popup, List } from 'semantic-ui-react'

import StyledNumber from 'components/Utils/StyledNumber'

import { Mode, Side, ArmyType, UnitAttribute, UnitType, Setting, TacticCalc, TerrainType, CombatPhase } from 'types'
import { CombatUnit, CombatUnitRoundInfo, CombatCohort, calculateUnitPips, calculateBaseDamage, getOffensiveUnitPips, getDefensiveUnitPips } from 'combat'
import { toSignedPercent, toManpower, strengthToValue, toNumber, addSign, toMultiplier } from 'formatters'
import { calculateValue } from 'definition_values'
import { AppState, getSettings, getSelectedTerrains, getGeneralStats, getCountry, getTactic, getCombatUnit, getCombatParticipant } from 'state'
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
    const { source, participant } = this.props
    if (!source)
      return null

    const target = source.target
    return (
      <List>
        {this.getInfoSection(source, target)}
        {target && <List.Item />}
        {target && this.getBaseDamageSection(source, target)}
        {target && <List.Item />}
        {target && this.getTotalDamageSection(source, target, participant.tactic_bonus, is_support)}
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

  getBaseDamageSection = (source: IUnit, target: IUnit) => {
    const { participant } = this.props
    const { phase } = participant
    const phase_roll = calculateUnitPips(source, target, UnitAttribute.Strength, phase)
    const morale_roll = calculateUnitPips(source, target, UnitAttribute.Morale)
    const multi = phase_roll || morale_roll

    if (multi) {
      return (<>
        {this.getBaseDamageSubSection(source, target, UnitAttribute.Strength, phase)}
        {<List.Item />}
        {this.getBaseDamageSubSection(source, target, UnitAttribute.Morale, phase)}
      </>)
    }
    return (<>
      {this.getBaseDamageSubSection(source, target, '', phase)}
    </>)
  }

  getBaseDamageSubSection = (source: IUnit, target: IUnit, type: UnitAttribute.Strength | UnitAttribute.Morale | '', phase: CombatPhase) => {
    const { settings, participant } = this.props
    const { dice, terrain_pips, general_pips } = participant
    const base_roll = settings[Setting.BaseRoll]
    const source_roll = type ? getOffensiveUnitPips(source, type, phase) : 0
    const target_roll = type ? getDefensiveUnitPips(target, type, phase) : 0
    const total_roll = dice + terrain_pips + general_pips[phase] + source_roll + target_roll
    const text = type === UnitAttribute.Morale ? UnitAttribute.Morale : phase
    return (<>
      {this.renderModifier('Base pips', base_roll, this.toAdd)}
      {this.renderModifier('Dice pips', dice, this.toAdd)}
      {this.renderModifier('Terrain pips', terrain_pips, this.toAdd)}
      {this.renderModifier('General pips', general_pips[phase], this.toAdd)}
      {this.renderModifier(text + ' pips', source_roll, this.toAdd)}
      {this.renderModifier('Enemy ' + text.toLowerCase() + ' pips', target_roll, this.toAdd)}
      {this.renderModifier('Roll damage', settings[Setting.RollDamage], this.toMultiplier)}
      {this.renderItem('Base ' + type.toLowerCase() + ' damage', calculateBaseDamage(total_roll, settings), this.toNumber)}
    </>)
  }

  getTotalDamageSection = (source: IUnit, target: IUnit, tactic_damage: number, is_support: boolean) => {
    const { terrains, settings, participant } = this.props
    const { phase } = participant
    const terrain_types = terrains.map(value => value.type)
    const strength = source[UnitAttribute.Strength] + source.strength_loss
    const offense_vs_defense = source[UnitAttribute.Offense] - target[UnitAttribute.Defense]
    const experience_reduction = target.experience_reduction
    const target_type = source[target.type]
    const is_loyal = source.is_loyal
    const total_damage = source.damage_multiplier

    const attributes: (UnitAttribute | UnitType)[] = [UnitAttribute.Discipline, UnitAttribute.DamageDone]
    const target_attributes: (UnitAttribute | UnitType)[] = [UnitAttribute.DamageTaken]

    return (<>
      {this.renderStyledItem('Tactic', tactic_damage, toSignedPercent)}
      {this.renderStyledItem('Loyal', is_loyal ? 0.1 : 0, toSignedPercent)}
      {attributes.map(attribute => this.getAttribute(source, attribute))}
      {this.renderStyledItem(target.type, target_type, toSignedPercent)}
      {this.renderStyledItem('Offense vs Defense', offense_vs_defense, toSignedPercent)}
      {settings[Setting.DisciplineDamageReduction] && this.renderStyledItem('Target discipline', 1 / (target[UnitAttribute.Discipline] + 1) - 1, toSignedPercent)}
      {this.renderStyledItem('Enemy experience', experience_reduction, toSignedPercent)}
      {target_attributes.map(terrain => this.getAttribute(target, terrain))}
      {terrain_types.map(terrain => this.getAttribute(source, terrain))}
      {is_support && this.renderStyledItem(UnitAttribute.BackrowEffectiveness, source[UnitAttribute.BackrowEffectiveness] - 1, toSignedPercent)}
      {settings[Setting.FireAndShock] && this.renderModifier(phase, source[phase], this.toMultiplier)}
      {this.renderModifier('Unit strength', strength, this.toMultiplier)}
      {this.renderItem('Damage multiplier', total_damage, this.toMultiplier)}
    </>)
  }

  getStrengthSection = (source: IUnit, target: IUnit) => {
    const { settings, tactic_s, tactic_t, mode, participant } = this.props
    const { phase } = participant
    const strength_lost_multiplier = settings[Setting.StrengthLostMultiplier]
    const tactic_casualties = calculateValue(tactic_s, TacticCalc.Casualties) + calculateValue(tactic_t, TacticCalc.Casualties)
    const strength_damage = source.strength_dealt

    return (<>
      {this.renderModifier('Constant', strength_lost_multiplier, value => mode === Mode.Land ? this.toMultiplier(Number(toManpower(value))) : this.toMultiplier(value))}
      {this.renderStyledItem('Tactic casualties', tactic_casualties, toSignedPercent)}
      {settings[Setting.FireAndShock] && this.getAttribute(source, phase === CombatPhase.Shock ? UnitAttribute.ShockDamageDone : UnitAttribute.FireDamageDone)}
      {settings[Setting.FireAndShock] && this.getAttribute(target, phase === CombatPhase.Shock ? UnitAttribute.ShockDamageTaken : UnitAttribute.FireDamageTaken)}
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
      {this.renderModifier('Constant', morale_lost_multiplier, this.toMultiplier)}
      {this.getAttribute(source, UnitAttribute.MoraleDamageDone)}
      {this.getAttribute(target, UnitAttribute.MoraleDamageTaken)}
      {this.renderModifier('Unit morale', morale, this.toMultiplier)}
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


interface IUnit extends CombatUnit, Omit<CombatUnitRoundInfo, 'target'> {
  target: IUnit | null
}

const convertUnit = (unit: CombatCohort | null, convert_target: boolean = true): IUnit | null => {
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
  participant: getCombatParticipant(state, props.side),
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
