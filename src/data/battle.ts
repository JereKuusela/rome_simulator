import { Mode } from "types/definition"
import { Battle, CountryName, Side, ModeState, TerrainType, Participant } from "types"

export const getInitialTerrains = (mode: Mode): TerrainType[] => {
  if (mode === Mode.Naval)
    return [TerrainType.Ocean]
  else
    return [TerrainType.None, process.env.REACT_APP_GAME === 'euiv' ? TerrainType.Grasslands : TerrainType.Plains]
} 

export const getDefaultParticipant = (name: CountryName): Participant => {
  return {
    country: name,
    rounds: [],
    rolls: [],
    dice: 3,
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

const initializeStuff = (): ModeState => ({ [Mode.Land]: getDefaultMode(Mode.Land), [Mode.Naval]: getDefaultMode(Mode.Naval) })

const battleState = initializeStuff()
