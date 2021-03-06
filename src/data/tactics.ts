import { ValuesType, Mode, TacticType, TacticCalc, TacticData, TacticValueType, UnitType, TacticsData } from 'types'
import { toObj } from 'utils'

import * as data from './json/ir/tactics.json'
import IconBottleneck from 'images/bottleneck.png'
import IconCavalrySkirmish from 'images/cavalry_skirmish.png'
import IconDeception from 'images/deception.png'
import IconEnvelopment from 'images/envelopment.png'
import IconHitAndRun from 'images/hit_and_run.png'
import IconPadmaVyuha from 'images/padma_vyuha.png'
import IconPhalanx from 'images/phalanx.png'
import IconShockAction from 'images/shock_action.png'
import IconSkirmishing from 'images/skirmishing.png'
import IconTriplexAcies from 'images/triplex_acies.png'
import IconFrontalAssault from 'images/frontal_assault.png'
import IconNavalEnvelopment from 'images/naval_envelopment.png'
import IconHarassment from 'images/harassment.png'
import IconProbingAttack from 'images/probing_attack.png'
import IconCloseRanks from 'images/close_ranks.png'
import { addValues } from '../data_values'

const tacticToIcon: { [key in TacticType]: string } = {
  [TacticType.Bottleneck]: IconBottleneck,
  [TacticType.CavalrySkirmish]: IconCavalrySkirmish,
  [TacticType.Deception]: IconDeception,
  [TacticType.Envelopment]: IconEnvelopment,
  [TacticType.HitAndRun]: IconHitAndRun,
  [TacticType.PadmaVyuha]: IconPadmaVyuha,
  [TacticType.Phalanx]: IconPhalanx,
  [TacticType.ShockAction]: IconShockAction,
  [TacticType.Skirmishing]: IconSkirmishing,
  [TacticType.TriplexAcies]: IconTriplexAcies,
  [TacticType.FrontalAssault]: IconFrontalAssault,
  [TacticType.NavalEnvelopment]: IconNavalEnvelopment,
  [TacticType.Harassment]: IconHarassment,
  [TacticType.ProbingAttack]: IconProbingAttack,
  [TacticType.CloseRanks]: IconCloseRanks
}

export const getTacticIcon = (type: TacticType) => tacticToIcon[type] || ''

const createTacticFromJson = (data: TacticJSON): TacticData => {
  const tactic: TacticData = {
    type: data.type as TacticType,
    mode: data.mode as Mode,
    image: tacticToIcon[data.type as TacticType] || ''
  }
  const baseValues: [TacticValueType, number][] = [
    [UnitType.Archers, data.archers || 0],
    [UnitType.CamelCavalry, data.camel_cavalry || 0],
    [UnitType.Chariots, data.chariots || 0],
    [UnitType.HeavyCavalry, data.heavy_cavalry || 0],
    [UnitType.HeavyInfantry, data.heavy_infantry || 0],
    [UnitType.HorseArchers, data.horse_archers || 0],
    [UnitType.LightCavalry, data.light_cavalry || 0],
    [UnitType.LightInfantry, data.light_infantry || 0],
    [UnitType.WarElephants, data.war_elephants || 0],
    [UnitType.Liburnian, data.liburnian || 0],
    [UnitType.Trireme, data.trireme || 0],
    [UnitType.Tetrere, data.tetrere || 0],
    [UnitType.Hexere, data.hexere || 0],
    [UnitType.Octere, data.octere || 0],
    [UnitType.MegaPolyreme, data.mega_polyreme || 0],
    [TacticCalc.Casualties, data.casualties || 0],
    [TacticType.Bottleneck, data.bottleneck || 0],
    [TacticType.CavalrySkirmish, data.cavalry_skirmish || 0],
    [TacticType.Deception, data.deception || 0],
    [TacticType.Envelopment, data.envelopment || 0],
    [TacticType.HitAndRun, data.hit_and_run || 0],
    [TacticType.PadmaVyuha, data.padma_vyuha || 0],
    [TacticType.Phalanx, data.phalanx || 0],
    [TacticType.ShockAction, data.shock_action || 0],
    [TacticType.Skirmishing, data.skirmishing || 0],
    [TacticType.TriplexAcies, data.triplex_acies || 0],
    [TacticType.FrontalAssault, data.frontal_assault || 0],
    [TacticType.NavalEnvelopment, data.naval_envelopment || 0],
    [TacticType.CloseRanks, data.close_ranks || 0],
    [TacticType.Harassment, data.harassment || 0],
    [TacticType.ProbingAttack, data.probing_attack || 0]
  ]
  return addValues(tactic, ValuesType.Base, tactic.type, baseValues)
}

const initializeDefaultTerrains = (): TacticsData => {
  if (process.env.REACT_APP_GAME === 'EU4') return {} as TacticsData
  else return toObj(data.tactics.map(createTacticFromJson), item => item.type)
}

const defaultTactics = initializeDefaultTerrains()

export const getDefaultTactics = () => defaultTactics
export const getDefaultTactic = (type: TacticType): TacticData => defaultTactics[type]

export const getDefaultTacticState = () => getDefaultTactics()

interface TacticJSON {
  type: string
  mode: string
  archers?: number
  camel_cavalry?: number
  chariots?: number
  heavy_cavalry?: number
  heavy_infantry?: number
  horse_archers?: number
  light_cavalry?: number
  light_infantry?: number
  war_elephants?: number
  liburnian?: number
  trireme?: number
  tetrere?: number
  hexere?: number
  octere?: number
  mega_polyreme?: number
  bottleneck?: number
  cavalry_skirmish?: number
  deception?: number
  envelopment?: number
  hit_and_run?: number
  padma_vyuha?: number
  phalanx?: number
  shock_action?: number
  skirmishing?: number
  triplex_acies?: number
  casualties?: number
  frontal_assault?: number
  naval_envelopment?: number
  close_ranks?: number
  harassment?: number
  probing_attack?: number
}
