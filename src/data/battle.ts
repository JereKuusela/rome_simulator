import { Mode, DefinitionType } from "types/definition"
import { Battle, CountryName, Side, ModeState, TerrainType, Participant } from "types"

export const getInitialTerrains = (mode: DefinitionType): TerrainType[] => {
  if (mode === DefinitionType.Naval)
    return [TerrainType.Ocean]
  else
    return [TerrainType.None, TerrainType.Plains]
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
