import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid, Input, Table, Header, Checkbox, Tab } from 'semantic-ui-react'

import { AppState, getMode } from 'state'

import Dropdown from 'components/Dropdowns/Dropdown'
import { toArr, keys, values, filterKeys } from 'utils'
import { Mode, Setting, parameterToDescription, SimulationSpeed, CombatSettings, SiteSettings } from 'types'
import { changeCombatParameter, changeSiteParameter, invalidate } from 'reducers'
import { getDefaultSiteSettings, getDefaultLandSettings } from 'data'

interface Props { }

type Values = string | number | boolean

const analyze = [
  Setting.Performance, Setting.PhaseLengthMultiplier, Setting.ReduceRolls, Setting.MaxDepth, Setting.ChunkSize, Setting.ShowGraphs,
  Setting.CalculateWinChance, Setting.CalculateCasualties, Setting.CalculateResourceLosses
]
const deployment = [Setting.CustomDeployment, Setting.DynamicFlanking, Setting.MoraleHitForNonSecondaryReinforcement]
const mechanics = [
  Setting.FireAndShock, Setting.StrengthBasedFlank, Setting.UseMaxMorale, Setting.InsufficientSupportPenalty, Setting.RollFrequency, Setting.CombatWidth,
  Setting.ExperienceDamageReduction, Setting.FixExperience, Setting.DefenderAdvantage, Setting.FixTargeting, Setting.BackRow, Setting.Culture,
  Setting.Tactics, Setting.Tech, Setting.Martial, Setting.Food, Setting.RetreatRounds, Setting.BackRowRetreat, Setting.FixFlankTargeting, Setting.SupportPhase
]
const damage = [
  Setting.DailyMoraleLoss, Setting.DailyDamageIncrease, Setting.Precision, Setting.BasePips, Setting.MaxGeneral,
  Setting.MaxPips, Setting.DiceMinimum, Setting.DiceMaximum, Setting.MinimumMorale, Setting.MinimumStrength
]
const attributes = [
  Setting.AttributeCombatAbility, Setting.AttributeDamage, Setting.AttributeUnitType, Setting.AttributeTerrainType, Setting.AttributeStrengthDamage,
  Setting.AttributeMoraleDamage, Setting.AttributeOffenseDefense, Setting.AttributeMilitaryTactics, Setting.AttributeExperience, Setting.AttributeDrill,
  Setting.DisciplineDamageReduction
]

const defaultSettings = { ...getDefaultLandSettings(), ...getDefaultSiteSettings() }

class Settings extends Component<IProps> {

  render() {
    const { combatSettings } = this.props
    const panes = [
      this.getMenuItem('Analyze', analyze),
      this.getMenuItem('Attributes', attributes),
      this.getMenuItem('Damage', damage),
      this.getMenuItem('Deployment', deployment),
      this.getModeMenuItem(),
      this.getMenuItem('Mechanics', mechanics)
    ]
    return (
      <Tab panes={panes} defaultActiveIndex={keys(combatSettings).findIndex(mode => mode === this.props.mode)} />
    )
  }

  getMenuItem = (key: string, attributes: Setting[]) => {
    const { siteSettings } = this.props
    return {
      menuItem: key,
      render: () => this.renderSiteSettings(key, siteSettings, attributes)
    }
  }

  getModeMenuItem = () => {
    return {
      menuItem: 'Land / Naval',
      render: () => this.renderModeSettings()
    }
  }

  renderModeSettings = () => {
    const { combatSettings } = this.props
    return (
      <Tab.Pane style={{ padding: 0 }}>
        {this.renderRow(Mode.Land, combatSettings[Mode.Land], (key, str) => this.onCombatChange(Mode.Land, key, str))}
        {this.renderRow(Mode.Naval, combatSettings[Mode.Naval], (key, str) => this.onCombatChange(Mode.Naval, key, str))}
      </Tab.Pane>
    )
  }

  renderSiteSettings = (key: string, settings: SiteSettings, attributes: Setting[]) => {
    return (
      <Tab.Pane style={{ padding: 0 }}>
        {this.renderRow(key, filterKeys(settings, setting => attributes.includes(setting)), this.onSharedChange)}
      </Tab.Pane>
    )
  }

  renderRow = <T extends Setting>(key: string, settings: { [key in T]: Values }, onChange: (key: T, str: Values) => void) => (
    <Grid padded celled key={key}>
      <Grid.Row columns='2'>
        {
          toArr(settings, (value, key) => {
            return (
              <Grid.Column key={key}>
                <Table basic='very'>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell collapsing style={{ width: 100 }} textAlign='center' >
                        {this.renderSetting(key, value, onChange)}
                      </Table.Cell>
                      <Table.Cell key={key + '_description'} style={{ whiteSpace: 'pre-line' }} >
                        <Header size='tiny'>{key}</Header>
                        {parameterToDescription(key, value)}
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table>
              </Grid.Column>
            )
          })
        }
        {
          toArr(settings).length % 2 ? <Grid.Column /> : null
        }
      </Grid.Row>
    </Grid>
  )

  renderSetting = <T extends Setting>(key: T, value: Values, onChange: (key: T, str: Values) => void) => {
    if (typeof value === 'number') {
      return (
        <Input
          size='mini'
          style={{ width: 60 }}
          defaultValue={value}
          placeholder={defaultSettings[key]}
          onChange={(_, { value }) => this.onInputChange(key, value, onChange)}
        />
      )
    }
    if (typeof value === 'boolean') {
      return (
        <Checkbox
          checked={value}
          onChange={(_, { checked }) => onChange(key, !!checked)}
        />
      )
    }
    if (key === Setting.Performance) {
      return (
        <Dropdown
          value={value}
          style={{ width: 100 }}
          values={values(SimulationSpeed)}
          onChange={value => onChange(key, value)}
        />
      )
    }
    return null
  }

  onInputChange = <T extends Setting>(key: T, str: string, onChange: (key: T, value: number) => void) => {
    const value = str.length ? +str : Number(defaultSettings[key])
    if (isNaN(value))
      return
    onChange(key, value)
  }

  onCombatChange = (mode: Mode, key: keyof CombatSettings, value: Values) => {
    const { changeCombatParameter, invalidate } = this.props
    changeCombatParameter(mode, key, value)
    invalidate()
  }

  onSharedChange = (key: keyof SiteSettings, value: Values) => {
    const { changeSiteParameter, invalidate } = this.props
    changeSiteParameter(key, value)
    invalidate()
  }
}

const mapStateToProps = (state: AppState) => ({
  combatSettings: state.settings.combatSettings,
  siteSettings: state.settings.siteSettings,
  mode: getMode(state)
})

const actions = { changeCombatParameter, changeSiteParameter, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(Settings)
