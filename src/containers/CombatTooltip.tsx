import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Popup, List } from 'semantic-ui-react'
import { last } from 'lodash'

import StyledNumber from 'components/Utils/StyledNumber'

import { DefinitionType, Side, ArmyType, UnitCalc, UnitType, Setting, TacticCalc, TerrainType } from 'types'
import { calculateTotalRoll, calculateBaseDamage, CombatUnitDefinition, CombatUnitRoundInfo, CombatUnit } from 'combat'
import { toSignedPercent, toManpower, strengthToValue, toNumber } from 'formatters'
import { calculateValue } from 'definition_values'
import { AppState, getCurrentCombat, getParticipant, getSettings, getSelectedTerrains, getGeneralStats, getCountry, getTactic, getCombatUnit } from 'state'
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
    const { source, tactic_bonus, roll, side, settings, terrains, general_s, general_t } = this.props
    if (!source)
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
        {target && this.getStrengthSection(source, target)}
        {target && <List.Item />}
        {target && this.getMoraleSection(source, target)}
      </List>
    )
  }

  toNumber = (value: number) => toNumber(value, 3)

  getBaseSection = (source: IUnit, target: IUnit, base_damage: number, tactic_damage: number, is_support: boolean) => {
    const { terrains } = this.props
    const terrain_types = terrains.map(value => value.type)
    const strength = source[UnitCalc.Strength] + source.strength_loss
    const offense_vs_defense = source[UnitCalc.Offense] - target[UnitCalc.Defense]
    const experience_reduction = target.experience_reduction
    const target_type = source[target.type]
    const is_loyal = source.is_loyal
    const total_damage = source.damage_dealt

    const attributes: (UnitCalc | UnitType)[] = [UnitCalc.Discipline, UnitCalc.DamageDone]
    const target_attributes: (UnitCalc | UnitType)[] = [UnitCalc.DamageTaken]

    return (<>
      {this.renderItem('Base damage', base_damage, this.toNumber)}
      {this.renderStyledItem('Tactic', tactic_damage, toSignedPercent)}
      {this.renderStyledItem('Loyal', is_loyal ? 0.1 : 0, toSignedPercent)}
      {attributes.map(attribute => this.getAttribute(source, attribute))}
      {this.renderStyledItem(target.type, target_type, toSignedPercent)}
      {this.renderStyledItem('Offense vs Defense', offense_vs_defense, toSignedPercent)}
      {this.renderStyledItem('Target experience', experience_reduction, toSignedPercent)}
      {target_attributes.map(terrain => this.getAttribute(target, terrain))}
      {terrain_types.map(terrain => this.getAttribute(source, terrain))}
      {is_support && this.renderStyledItem(UnitCalc.BackrowEffectiveness, source[UnitCalc.BackrowEffectiveness] - 1, toSignedPercent)}
      {this.renderMultiplier('Unit strength', strength, toNumber)}
      {this.renderItem('Total damage', total_damage, this.toNumber)}
    </>)
  }

  getStrengthSection = (source: IUnit, target: IUnit) => {
    const { settings, tactic_s, tactic_t, mode } = this.props
    const strength_lost_multiplier = settings[Setting.StrengthLostMultiplier]
    const tactic_casualties = calculateValue(tactic_s, TacticCalc.Casualties) + calculateValue(tactic_t, TacticCalc.Casualties)

    const strength_damage = source.strength_dealt

    return (<>
      {this.renderMultiplier('Constant', strength_lost_multiplier, value => mode === DefinitionType.Land ? toManpower(value) : String(value))}
      {this.renderStyledItem('Tactic casualties', tactic_casualties, toSignedPercent)}
      {this.getAttribute(source, UnitCalc.StrengthDamageDone)}
      {this.getAttribute(target, UnitCalc.StrengthDamageTaken)}
      {this.renderItem('Strength damage', strength_damage, value => strengthToValue(mode, value))}
    </>)
  }

  getMoraleSection = (source: IUnit, target: IUnit) => {
    const { settings } = this.props
    const morale_lost_multiplier = settings[Setting.MoraleLostMultiplier]
    const morale = source[UnitCalc.Morale] + source.morale_loss
    const morale_damage = source.morale_dealt

    return (<>
      {this.renderMultiplier('Constant', morale_lost_multiplier, String)}
      {this.getAttribute(source, UnitCalc.MoraleDamageDone)}
      {this.getAttribute(target, UnitCalc.MoraleDamageTaken)}
      {this.renderMultiplier('Unit morale', morale, toNumber)}
      {this.renderItem('Morale damage', morale_damage, this.toNumber)}
    </>)
  }

  getAttribute = (unit: IUnit, attribute: UnitCalc | UnitType | TerrainType) => (
    this.renderStyledItem(attribute, unit[attribute], toSignedPercent)
  )

  getInfoSection = (source: IUnit, target: IUnit | null) => {
    const { mode } = this.props
    const morale_current = source[UnitCalc.Morale]
    const moraleMax = source.max_morale
    const morale_loss = -source.morale_loss
    const strength_current = source[UnitCalc.Strength]
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
  tactic_bonus: getCurrentCombat(state, props.side).tactic_bonus,
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
