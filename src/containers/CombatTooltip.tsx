import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Popup, List } from 'semantic-ui-react'

import StyledNumber from 'components/Utils/StyledNumber'

import { SideType, ArmyPart, UnitAttribute, UnitType, Setting, TerrainType, CombatPhase, Mode, CohortProperties, CohortRoundInfo, Cohort, DisciplineValue, formTerrainAttribute, UnitValueType } from 'types'
import { calculateCohortPips, getOffensiveCohortPips, getDefensiveCohortPips, getCombatPhase, getDefensiveSupportCohortPips } from 'combat'
import { toSignedPercent, strengthToValue, toNumber, addSign, toMultiplier, toMorale } from 'formatters'
import { AppState, getSettings, getSelectedTerrains, getCohort, getCombatSide, getMode } from 'state'
import { noZero } from 'utils'
import { getCohortName } from 'managers/units'

type Props = {
  row: number | null
  column: number | null
  isSupport: boolean
  context: HTMLElement | null
  side: SideType
  part: ArmyPart
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
    const { source, context, isSupport } = this.props
    return (
      <Popup
        open={source !== null}
        context={context!}
        content={this.getExplanation(isSupport)}
        inverted
      />
    )
  }

  BLUE = 'color-blue'
  ORANGE = 'color-orange'
  RED = 'color-red'

  getExplanation = (isSupport: boolean) => {
    const { source } = this.props
    if (!source)
      return null

    const target = source.target
    const targetSupport = source.targetSupport
    return (
      <List>
        {this.getInfoSection(source, target)}
        {target && <List.Item />}
        {target && this.getBaseDamageSection(source, target, targetSupport)}
        {target && <List.Item />}
        {target && this.getDamageMultiplierSection(source, target, isSupport)}
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

  getBaseDamageSection = (source: IUnit, target: IUnit, targetSupport: IUnit | null) => {
    const { results, settings } = this.props
    const { round } = results
    const phase = getCombatPhase(round, settings)
    const phaseRoll = calculateCohortPips(source, target, targetSupport, UnitAttribute.Strength, phase)
    const moraleRoll = calculateCohortPips(source, target, targetSupport, UnitAttribute.Morale)
    const multi = phaseRoll || moraleRoll

    if (multi) {
      return (<>
        {this.getBaseDamageSubSection(source, target, targetSupport, UnitAttribute.Strength, phase)}
        {<List.Item />}
        {this.getBaseDamageSubSection(source, target, targetSupport, UnitAttribute.Morale, phase)}
      </>)
    }
    return (<>
      {this.getBaseDamageSubSection(source, target, targetSupport, '', phase)}
    </>)
  }

  getBaseDamageSubSection = (source: IUnit, target: IUnit, targetSupport: IUnit | null, type: UnitAttribute.Strength | UnitAttribute.Morale | '', phase: CombatPhase) => {
    const { settings, results } = this.props
    const { dice, terrainPips, generalPips, actualBonusPips, totalBonusPips } = results
    const basePips = settings[Setting.BasePips]
    const sourcePips = type ? getOffensiveCohortPips(source, type, phase) : 0
    const targetPips = type ? getDefensiveCohortPips(target, type, phase) : 0
    const targetSupportPips = type ? getDefensiveSupportCohortPips(targetSupport, type, phase) : 0
    const totalPips = basePips + actualBonusPips + sourcePips + targetPips + targetSupportPips
    const enemyReduction = actualBonusPips - totalBonusPips
    const cappedPips = Math.min(totalPips, settings[Setting.MaxPips])
    const reductionToCap = Math.min(0, settings[Setting.MaxPips] - cappedPips)
    const text = type === UnitAttribute.Morale ? UnitAttribute.Morale : phase
    return (<>
      {this.renderModifier('Base pips', basePips, this.toAdd)}
      {this.renderModifier('Dice', dice, this.toAdd)}
      {this.renderModifier('Terrain pips', terrainPips, this.toAdd)}
      {this.renderModifier('General pips', generalPips, this.toAdd)}
      {this.renderModifier(text + ' pips', sourcePips, this.toAdd)}
      {this.renderModifier('Enemy pips', enemyReduction, this.toAdd)}
      {this.renderModifier('Enemy ' + text.toLowerCase() + ' pips', targetPips, this.toAdd)}
      {this.renderModifier('Backrow ' + text.toLowerCase() + ' pips', targetSupportPips, this.toAdd)}
      {this.renderModifier('Above maximum', reductionToCap, this.toAdd)}
      {this.renderItem('Total ' + type.toLowerCase() + ' pips', cappedPips, this.toNumber)}
    </>)
  }

  getDamageMultiplierSection = (source: IUnit, target: IUnit, isSupport: boolean) => {
    const { terrains, settings, results } = this.props
    const { round, tacticBonus, dailyMultiplier } = results
    const phase = getCombatPhase(round, settings)
    const terrainTypes = settings[Setting.AttributeTerrainType] ? terrains.map(value => formTerrainAttribute(value.type, UnitAttribute.Damage)) : []
    const strength = source[UnitAttribute.Strength] + source.strengthLoss
    const offenseVsDefense = settings[Setting.AttributeOffenseDefense] ? source[UnitAttribute.Offense] - target[UnitAttribute.Defense] : 0
    const experienceReduction = settings[Setting.AttributeExperience] ? target.experienceReduction : 0
    const targetType = settings[Setting.CounteringDamage] > 0 ? source[target.type] : 0
    const isLoyal = source.isLoyal
    const multiplier = source.damageMultiplier
    const morale = (source[UnitAttribute.Morale] + source.moraleLoss) / source.maxMorale
    const damageLossForMissingMorale = (morale - 1) * settings[Setting.DamageLossForMissingMorale]

    return (<>
      {this.renderStyledItem('Lost morale', damageLossForMissingMorale, toSignedPercent)}
      {this.renderStyledItem('Tactic', tacticBonus, toSignedPercent)}
      {this.renderStyledItem('Enemy insufficient support', target.flankRatioPenalty - 1, toSignedPercent)}
      {this.renderStyledItem('Loyal', isLoyal ? 0.1 : 0, toSignedPercent)}
      {settings[Setting.AttributeDiscipline] !== DisciplineValue.Off && this.getAttribute(source, UnitAttribute.Discipline)}
      {settings[Setting.AttributeDamage] && this.getAttribute(source, UnitAttribute.DamageDone)}
      {settings[Setting.AttributeCombatAbility] && this.getAttribute(source, UnitAttribute.CombatAbility)}
      {this.renderStyledItem(target.type, targetType, toSignedPercent)}
      {this.renderStyledItem('Offense vs Defense', offenseVsDefense, toSignedPercent)}
      {settings[Setting.AttributeDiscipline] === DisciplineValue.Both && this.renderStyledItem('Target discipline', 1 / noZero(target[UnitAttribute.Discipline] + 1) - 1, toSignedPercent)}
      {this.renderStyledItem('Enemy experience', experienceReduction, toSignedPercent)}
      {settings[Setting.AttributeDamage] && this.getAttribute(target, UnitAttribute.DamageTaken)}
      {terrainTypes.map(terrain => this.getAttribute(source, terrain))}
      {isSupport && this.renderStyledItem(UnitAttribute.OffensiveSupport, source[UnitAttribute.OffensiveSupport] - 1, toSignedPercent)}
      {this.renderStyledItem('Battle length', dailyMultiplier - 1, toSignedPercent)}
      {settings[Setting.FireAndShock] && this.renderModifier(phase, source[phase], this.toMultiplier)}
      {settings[Setting.AttributeMilitaryTactics] && this.renderModifier('Target military tactics', 1 / noZero(target[UnitAttribute.MilitaryTactics]), this.toMultiplier)}
      {this.renderModifier('Unit strength', strength, this.toMultiplier)}
      {this.renderItem('Damage multiplier', multiplier, this.toMultiplier)}
    </>)
  }

  getStrengthSection = (source: IUnit, target: IUnit) => {
    const { settings, mode, results } = this.props
    const { round, tacticStrengthDamageMultiplier } = results
    const phase = getCombatPhase(round, settings)
    const strengthLostMultiplier = mode === Mode.Land ? settings[Setting.StrengthLostMultiplier] : settings[Setting.StrengthLostMultiplier] / 1000
    const strengthDamage = source.strengthDealt

    return (<>
      {this.renderModifier('Constant', strengthLostMultiplier, this.toMultiplier)}
      {this.renderStyledItem('Tactic casualties', tacticStrengthDamageMultiplier - 1, toSignedPercent)}
      {settings[Setting.FireAndShock] && this.getAttribute(source, phase === CombatPhase.Shock ? UnitAttribute.ShockDamageDone : UnitAttribute.FireDamageDone)}
      {settings[Setting.FireAndShock] && this.getAttribute(target, phase === CombatPhase.Shock ? UnitAttribute.ShockDamageTaken : UnitAttribute.FireDamageTaken)}
      {settings[Setting.AttributeStrengthDamage] && this.getAttribute(source, UnitAttribute.StrengthDamageDone)}
      {settings[Setting.AttributeStrengthDamage] && this.getAttribute(target, UnitAttribute.StrengthDamageTaken)}
      {this.renderItem('Strength damage', strengthDamage, value => strengthToValue(mode, value))}
    </>)
  }

  getMoraleSection = (source: IUnit, target: IUnit) => {
    const { settings } = this.props
    const moraleLostMultiplier = settings[Setting.MoraleLostMultiplier]
    const morale = settings[Setting.UseMaxMorale] ? source.maxMorale : (source[UnitAttribute.Morale] + source.moraleLoss)
    const moraleStr = settings[Setting.UseMaxMorale] ? 'Unit max morale' : 'Unit morale'
    const moraleDamage = source.moraleDealt

    return (<>
      {settings[Setting.MoraleDamageBasedOnTargetStrength] && this.renderStyledItem('Target strength', 1 / (target[UnitAttribute.Strength] + target.strengthLoss), toMultiplier)}
      {this.renderModifier('Constant', moraleLostMultiplier / 1000.0, this.toMultiplier)}
      {settings[Setting.AttributeMoraleDamage] && this.getAttribute(source, UnitAttribute.MoraleDamageDone)}
      {settings[Setting.AttributeMoraleDamage] && this.getAttribute(target, UnitAttribute.MoraleDamageTaken)}
      {this.renderModifier(moraleStr, morale, this.toMultiplier)}
      {this.renderItem('Morale damage', moraleDamage, this.toNumber)}
    </>)
  }

  getAttribute = (unit: IUnit, attribute: UnitValueType) => (
    this.renderStyledItem(attribute, unit[attribute], toSignedPercent)
  )

  getInfoSection = (source: IUnit, target: IUnit | null) => {
    const { mode } = this.props
    const moraleCurrent = source[UnitAttribute.Morale]
    const moraleMax = source.maxMorale
    const moraleLoss = -source.moraleLoss
    const strengthCurrent = source[UnitAttribute.Strength]
    const strengthLoss = -source.strengthLoss
    return (<>
      <List.Item>
        {getCohortName(source)}
      </List.Item>
      {source.isDefeated ? <List.Item>{'Defeated at round ' + source.defeatedDay}</List.Item> : null}
      <List.Item>
        {'Strength: '}
        <span className={this.ORANGE}>{strengthToValue(mode, strengthCurrent)}</span>
        {
          strengthLoss ?
            <>
              {' ('}
              <StyledNumber value={strengthLoss} formatter={value => strengthToValue(mode, value)} negativeColor={this.RED} />
              {')'}
            </>
            : null
        }

      </List.Item>
      <List.Item>
        {'Morale: '}
        <span className={this.ORANGE}>{toMorale(moraleCurrent) + ' / ' + toMorale(moraleMax)}</span>
        {
          moraleLoss ?
            <>
              {' ('}
              <StyledNumber value={moraleLoss} formatter={this.toNumber} negativeColor={this.RED} />
              {')'}
            </>
            : null
        }
      </List.Item>
      <List.Item>
        {'Target: '}
        <span className={this.ORANGE}>{target ? getCohortName(target) : 'No target'}</span>
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
        <StyledNumber value={value} formatter={formatter} negativeColor={this.RED} />
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


interface IUnit extends CohortProperties, Omit<CohortRoundInfo, 'target' | 'targetSupport'> {
  target: IUnit | null
  targetSupport: IUnit | null
}

const convertUnit = (cohort: Cohort | null, convertTarget: boolean = true): IUnit | null => {
  if (!cohort)
    return null
  return {
    ...cohort.properties,
    ...cohort.state,
    ...cohort,
    target: convertTarget ? convertUnit(cohort.state.target, false) : null,
    targetSupport: convertTarget && cohort.state.targetSupport ? convertUnit(cohort.state.targetSupport, false) : null
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  source: (props.row !== null && props.column !== null) ? convertUnit(getCohort(state, props.side, props.part, props.row, props.column)) : null,
  results: getCombatSide(state, props.side).results,
  settings: getSettings(state),
  terrains: getSelectedTerrains(state),
  mode: getMode(state)
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(CombatTooltip)
