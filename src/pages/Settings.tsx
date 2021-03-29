import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Grid, Tab } from 'semantic-ui-react'

import { AppState } from 'state'

import { filterKeys } from 'utils'
import { CombatSettings, Mode, Setting, SiteSettings } from 'types'
import { changeCombatParameter, changeSiteParameter } from 'reducers'
import Transfer from 'containers/Transfer'
import GridSettings from 'components/GridSettings'
import AccordionToggle from 'containers/AccordionToggle'

const deployment = [
  Setting.CustomDeployment,
  Setting.DynamicFlanking,
  Setting.MoraleHitForNonSecondaryReinforcement,
  Setting.MoraleHitForLateDeployment,
  Setting.SupportPhase
]
const mechanics = [
  Setting.FireAndShock,
  Setting.StrengthBasedFlank,
  Setting.UseMaxMorale,
  Setting.InsufficientSupportPenalty,
  Setting.PhaseLength,
  Setting.BaseCombatWidth,
  Setting.ExperienceDamageReduction,
  Setting.FixExperience,
  Setting.DefenderAdvantage,
  Setting.BackRow,
  Setting.Culture,
  Setting.AttributeLoyal,
  Setting.AttackerSwapping,
  Setting.Tactics,
  Setting.Tech,
  Setting.Martial,
  Setting.Food,
  Setting.FixFlankTargeting,
  Setting.MoraleDamageBasedOnTargetStrength,
  Setting.DamageLossForMissingMorale,
  Setting.MoraleGainForWinning,
  Setting.MaxCountering,
  Setting.CounteringDamage,
  Setting.CounteringMode,
  Setting.GlobalTargeting
]
const damage = [
  Setting.DailyMoraleLoss,
  Setting.DailyDamageIncrease,
  Setting.Precision,
  Setting.BasePips,
  Setting.MaxGeneral,
  Setting.MaxPips,
  Setting.DiceMinimum,
  Setting.DiceMaximum,
  Setting.MinimumMorale,
  Setting.MinimumStrength,
  Setting.RelativePips,
  Setting.CohortSize
]
const stackwipe = [
  Setting.Stackwipe,
  Setting.StackwipeRounds,
  Setting.SoftStackWipeLimit,
  Setting.HardStackWipeLimit,
  Setting.RetreatRounds,
  Setting.BackRowRetreat,
  Setting.StackWipeCaptureChance
]
const attributes = [
  Setting.AttributeCombatAbility,
  Setting.AttributeDamage,
  Setting.AttributeTerrainType,
  Setting.AttributeStrengthDamage,
  Setting.AttributeMoraleDamage,
  Setting.AttributeOffenseDefense,
  Setting.AttributeMilitaryTactics,
  Setting.AttributeExperience,
  Setting.AttributeDrill,
  Setting.AttributeDiscipline
]

const Settings = () => {
  const { combatSettings, siteSettings } = useSelector((state: AppState) => state.settings)
  const dispatch = useDispatch()
  const onChangeSiteParameter = useCallback(
    (key: keyof SiteSettings, value: string | number | boolean) => dispatch(changeSiteParameter(key, value)),
    [dispatch]
  )
  const onChangeCombatParameter = useCallback(
    (mode: Mode, key: keyof CombatSettings, value: string | number | boolean) =>
      dispatch(changeCombatParameter(mode, key, value)),
    [dispatch]
  )

  const getSection = (key: string, attributes: Setting[]) => {
    return (
      <Grid.Row>
        <AccordionToggle title={key} identifier={key} open>
          <GridSettings
            settings={filterKeys(siteSettings, setting => attributes.includes(setting))}
            onChange={onChangeSiteParameter}
          />
        </AccordionToggle>
      </Grid.Row>
    )
  }

  const getSettingsMenuItem = () => {
    return {
      menuItem: 'Settings',
      render: () => {
        return (
          <Grid padded>
            {getSection('Attributes', attributes)}
            {getSection('Damage', damage)}
            {getSection('Deployment', deployment)}
            {renderModeSettings()}
            {getSection('Mechanics', mechanics)}
            {getSection('Stack wipe & Retreat', stackwipe)}
          </Grid>
        )
      }
    }
  }
  const getTransferMenuItem = () => {
    return {
      menuItem: 'Import / Export',
      render: () => <Transfer />
    }
  }

  const renderModeSettings = () => {
    return (
      <Grid.Row>
        <AccordionToggle title={'Land / Naval'} identifier={'Land / Naval'} open>
          <GridSettings
            settings={combatSettings[Mode.Land]}
            onChange={(key, str) => onChangeCombatParameter(Mode.Land, key, str)}
          />
          <GridSettings
            settings={combatSettings[Mode.Naval]}
            onChange={(key, str) => onChangeCombatParameter(Mode.Naval, key, str)}
          />
        </AccordionToggle>
      </Grid.Row>
    )
  }

  const panes = [getSettingsMenuItem(), getTransferMenuItem()]
  return <Tab panes={panes} />
}

export default Settings
