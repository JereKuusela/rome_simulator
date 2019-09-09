import { TacticType, TacticCalc, TacticDefinition, ValueType } from './actions'
import { addValues, ValuesType, DefinitionType } from '../../base_definition'
import { UnitType } from '../units/actions'
import { toObj } from '../../utils'

import * as data from './tactics.json'
import IconBottleneck from '../../images/bottleneck.png'
import IconCavalrySkirmish from '../../images/cavalry_skirmish.png'
import IconDeception from '../../images/deception.png'
import IconEnvelopment from '../../images/envelopment.png'
import IconHitAndRun from '../../images/hit_and_run.png'
import IconPadmaVyuha from '../../images/padma_vyuha.png'
import IconPhalanx from '../../images/phalanx.png'
import IconShockAction from '../../images/shock_action.png'
import IconSkirmishing from '../../images/skirmishing.png'
import IconTriplexAcies from '../../images/triplex_acies.png'
import IconFrontalAssault from '../../images/frontal_assault.png'
import IconNavalEnvelopment from '../../images/naval_envelopment.png'
import IconHarassment from '../../images/harassment.png'
import IconProbingAttack from '../../images/probing_attack.png'
import IconCloseRanks from '../../images/close_ranks.png'

const tactic_to_icon: { [ key in TacticType ]: string } = {
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

const createTacticFromJson = (data: TacticData): TacticDefinition => {
  let tactic: TacticDefinition = { type: data.type as TacticType, mode: data.mode as DefinitionType, image: tactic_to_icon[data.type as TacticType] || '' }
  const base_values: [ValueType, number][] = [
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
    [UnitType.MegaGalley, data.mega_galley || 0],
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
  return addValues(tactic, ValuesType.Base, tactic.type, base_values)
}

export type TacticDefinitions = { [key in TacticType]: TacticDefinition }

const initializeDefaultTactics = (): TacticDefinitions => toObj(data.tactics.map(createTacticFromJson), unit => unit.type)

const defaultTactics = initializeDefaultTactics()

export const getDefaultTactics = () => defaultTactics
export const getDefaultTactic = (type: TacticType): TacticDefinition => defaultTactics[type]

interface TacticData {
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
  mega_galley?: number
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
