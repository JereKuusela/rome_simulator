import { Mode } from "types/definition"
import { Battle, CountryName, SideType, ModeState, TerrainType, Participant, ArmyName, SideData } from "types"

export const getInitialTerrains = (mode: Mode): TerrainType[] => {
  if (mode === Mode.Naval)
    return [TerrainType.Ocean]
  else
    return [TerrainType.None, process.env.REACT_APP_GAME === 'euiv' ? TerrainType.Grasslands : TerrainType.Plains]
}

export const getDefaultSide = (type: SideType, name: CountryName, mode: Mode): SideData => {
  return {
    type,
    participants: [getDefaultParticipant(name, mode), getDefaultParticipant(name, mode)],
    rounds: [],
    rolls: [0],
    dice: (process.env.REACT_APP_GAME === 'euiv' ? 5 : 3),
    randomizeDice: false
  }
}

export const getDefaultParticipant = (name: CountryName, mode: Mode): Participant => {
  return {
    countryName: name,
    armyName: mode === Mode.Land ? ArmyName.Army : ArmyName.Navy,
    daysUntilBattle: 0
  }
}

export const getDefaultMode = (mode: Mode): Battle => ({
  sides: { [SideType.Attacker]: getDefaultSide(SideType.Attacker, CountryName.Country1, mode), [SideType.Defender]: getDefaultSide(SideType.Defender, CountryName.Country2, mode) },
  terrains: getInitialTerrains(mode),
  round: -1,
  fightOver: true,
  seed: 0,
  customSeed: undefined,
  outdated: true,
  timestamp: 0
})

export const getDefaultBattle = (): ModeState => battleState

const initializeStuff = (): ModeState => ({ [Mode.Land]: getDefaultMode(Mode.Land), [Mode.Naval]: getDefaultMode(Mode.Naval) })

const battleState = initializeStuff()
