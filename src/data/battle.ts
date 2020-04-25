import { Mode } from "types/definition"
import { Battle, CountryName, Side, ModeState, TerrainType, Participant, ArmyName } from "types"

export const getInitialTerrains = (mode: Mode): TerrainType[] => {
  if (mode === Mode.Naval)
    return [TerrainType.Ocean]
  else
    return [TerrainType.None, process.env.REACT_APP_GAME === 'euiv' ? TerrainType.Grasslands : TerrainType.Plains]
} 

export const getDefaultParticipant = (name: CountryName, mode: Mode): Participant => {
  return {
    country: name,
    army: mode === Mode.Land ? ArmyName.Army : ArmyName.Navy,
    rounds: [],
    rolls: [0],
    dice: (process.env.REACT_APP_GAME === 'euiv' ? 5 : 3),
    randomize_dice: false
  }
}

export const getDefaultMode = (mode: Mode): Battle => ({
  participants: { [Side.Attacker]: getDefaultParticipant(CountryName.Country1, mode), [Side.Defender]: getDefaultParticipant(CountryName.Country2, mode) },
  terrains: getInitialTerrains(mode),
  round: -1,
  fight_over: true,
  seed: 0,
  custom_seed: undefined,
  outdated: true,
  timestamp: 0
})

export const getDefaultBattle = (): ModeState => battleState

const initializeStuff = (): ModeState => ({ [Mode.Land]: getDefaultMode(Mode.Land), [Mode.Naval]: getDefaultMode(Mode.Naval) })

const battleState = initializeStuff()
