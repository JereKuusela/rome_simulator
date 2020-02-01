import { Mode, DefinitionType } from "types/definition"
import { Battle, CountryName, Side, ModeState, TerrainType, TacticType, UnitPreferences, UnitPreferenceType, UnitType, Army, Participant } from "types"

export const getInitialTerrains = (mode: DefinitionType): TerrainType[] => {
  if (mode === DefinitionType.Naval)
    return [TerrainType.Ocean]
  else
    return [TerrainType.None, TerrainType.Plains]
} 

const getInitialTactic = (mode: Mode): TacticType => mode === DefinitionType.Land ? TacticType.Deception : TacticType.FrontalAssault

const getInitialRowTypes = (mode: Mode): UnitPreferences => {
  if (mode === DefinitionType.Naval) {
    return {
      [UnitPreferenceType.Primary]: UnitType.MegaPolyreme,
      [UnitPreferenceType.Secondary]: UnitType.MegaPolyreme,
      [UnitPreferenceType.Flank]: UnitType.MegaPolyreme
    }
  }
  else {
    return {
      [UnitPreferenceType.Primary]: UnitType.Archers,
      [UnitPreferenceType.Secondary]: UnitType.HeavyInfantry,
      [UnitPreferenceType.Flank]: UnitType.LightCavalry
    }
  }
}

const initializeDefaultArmy = (mode: Mode): Army => ({
  frontline: Array(30).fill(null),
  reserve: [],
  defeated: [],
  tactic: getInitialTactic(mode),
  unit_preferences: getInitialRowTypes(mode),
  flank_size: 5,
  selections: {}
})
const defaultLandArmy = initializeDefaultArmy(DefinitionType.Land)
const defaultNavalArmy = initializeDefaultArmy(DefinitionType.Naval)

export const getDefaultArmy = (mode: Mode): Army => {
  if (mode === DefinitionType.Naval)
    return defaultNavalArmy
  return defaultLandArmy
}

export const getDefaultParticipant = (name: CountryName): Participant => {
  return {
    country: name,
    rounds: [],
    rolls: [],
    roll: 3,
    randomize_roll: false
  }
}

export const getDefaultMode = (mode: Mode): Battle => ({
  armies: { [CountryName.Country1]: getDefaultArmy(mode), [CountryName.Country2]: getDefaultArmy(mode) },
  participants: { [Side.Attacker]: getDefaultParticipant(CountryName.Country1), [Side.Defender]: getDefaultParticipant(CountryName.Country2) },
  terrains: getInitialTerrains(mode),
  round: -1,
  fight_over: true,
  seed: 0,
  custom_seed: undefined,
  outdated: true
})

export const getDefaultBattle = (): ModeState => battleState

const initializeStuff = (): ModeState => ({ [DefinitionType.Land]: getDefaultMode(DefinitionType.Land), [DefinitionType.Naval]: getDefaultMode(DefinitionType.Naval) })

const battleState = initializeStuff()
