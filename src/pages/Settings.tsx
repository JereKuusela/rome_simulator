import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Tab } from 'semantic-ui-react'

import { AppState, getMode } from 'state'

import { keys, filterKeys } from 'utils'
import { Mode, Setting, SiteSettings } from 'types'
import { changeCombatParameter, changeSiteParameter } from 'reducers'
import Transfer from 'containers/Transfer'
import GridSettings from 'components/GridSettings'

interface Props { }

const deployment = [Setting.CustomDeployment, Setting.DynamicFlanking, Setting.MoraleHitForNonSecondaryReinforcement, Setting.MoraleHitForLateDeployment, Setting.SupportPhase]
const mechanics = [
  Setting.FireAndShock, Setting.StrengthBasedFlank, Setting.UseMaxMorale, Setting.InsufficientSupportPenalty, Setting.PhaseLength, Setting.CombatWidth,
  Setting.ExperienceDamageReduction, Setting.FixExperience, Setting.DefenderAdvantage, Setting.BackRow, Setting.Culture, Setting.AttributeLoyal, Setting.AttackerSwapping,
  Setting.Tactics, Setting.Tech, Setting.Martial, Setting.Food, Setting.FixFlankTargeting, Setting.MoraleDamageBasedOnTargetStrength, Setting.DamageLossForMissingMorale,
  Setting.MoraleGainForWinning
]
const damage = [
  Setting.DailyMoraleLoss, Setting.DailyDamageIncrease, Setting.Precision, Setting.BasePips, Setting.MaxGeneral,
  Setting.MaxPips, Setting.DiceMinimum, Setting.DiceMaximum, Setting.MinimumMorale, Setting.MinimumStrength, Setting.RelativePips
]
const stackwipe = [
  Setting.Stackwipe, Setting.StackwipeRounds, Setting.SoftStackWipeLimit, Setting.HardStackWipeLimit, Setting.RetreatRounds, Setting.BackRowRetreat, Setting.StackWipeCaptureChance
]
const attributes = [
  Setting.AttributeCombatAbility, Setting.AttributeDamage, Setting.AttributeUnitType, Setting.AttributeTerrainType, Setting.AttributeStrengthDamage,
  Setting.AttributeMoraleDamage, Setting.AttributeOffenseDefense, Setting.AttributeMilitaryTactics, Setting.AttributeExperience, Setting.AttributeDrill,
  Setting.AttributeDiscipline
]

class Settings extends Component<IProps> {

  render() {
    const { combatSettings } = this.props
    const panes = [
      this.getMenuItem('Attributes', attributes),
      this.getMenuItem('Damage', damage),
      this.getMenuItem('Deployment', deployment),
      this.getModeMenuItem(),
      this.getMenuItem('Mechanics', mechanics),
      this.getMenuItem('Stack wipe & Retreat', stackwipe),
      this.getTransferMenuItem()
    ]
    return (
      <Tab panes={panes} defaultActiveIndex={keys(combatSettings).findIndex(mode => mode === this.props.mode)} />
    )
  }

  getMenuItem = (key: string, attributes: Setting[]) => {
    const { siteSettings } = this.props
    return {
      menuItem: key,
      render: () => this.renderSiteSettings(siteSettings, attributes)
    }
  }

  getModeMenuItem = () => {
    return {
      menuItem: 'Land / Naval',
      render: () => this.renderModeSettings()
    }
  }

  getTransferMenuItem = () => {
    return {
      menuItem: 'Import / Export',
      render: () => <Transfer />
    }
  }

  renderModeSettings = () => {
    const { combatSettings, changeCombatParameter } = this.props
    return (
      <Tab.Pane style={{ padding: 0 }}>
        <GridSettings settings={combatSettings[Mode.Land]} onChange={(key, str) => changeCombatParameter(Mode.Land, key, str)} />
        <GridSettings settings={combatSettings[Mode.Naval]} onChange={(key, str) => changeCombatParameter(Mode.Naval, key, str)} />
      </Tab.Pane>
    )
  }

  renderSiteSettings = (settings: SiteSettings, attributes: Setting[]) => {
    return (
      <Tab.Pane style={{ padding: 0 }}>
        <GridSettings settings={filterKeys(settings, setting => attributes.includes(setting))} onChange={this.props.changeSiteParameter} />
      </Tab.Pane>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  combatSettings: state.settings.combatSettings,
  siteSettings: state.settings.siteSettings,
  mode: getMode(state)
})

const actions = { changeCombatParameter, changeSiteParameter }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Settings)
