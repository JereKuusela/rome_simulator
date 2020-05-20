import { Mode } from "types/definition"
import { Battle, CountryName, SideType, ModeState, TerrainType, Participant, ArmyName, SideData } from "types"
import { mapRange } from "utils"

export const getInitialTerrains = (mode: Mode): TerrainType[] => {
  if (mode === Mode.Naval)
    return [TerrainType.Ocean]
  else
    return [TerrainType.None, process.env.REACT_APP_GAME === 'euiv' ? TerrainType.Grasslands : TerrainType.Plains]
}

export const getDefaultSide = (type: SideType, name: CountryName, mode: Mode, participants: number): SideData => {
  return {
    type,
    participants: mapRange(participants, () => getDefaultParticipant(name, mode)),
    days: [],
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

export const getDefaultMode = (mode: Mode, participants: number = 2): Battle => ({
  sides: { [SideType.Attacker]: getDefaultSide(SideType.Attacker, CountryName.Country1, mode, participants), [SideType.Defender]: getDefaultSide(SideType.Defender, CountryName.Country2, mode, participants) },
  terrains: getInitialTerrains(mode),
  fightOver: true,
  seed: 0,
  customSeed: undefined,
  outdated: true,
  timestamp: 0,
  days: []
})

export const getDefaultBattle = (participants: number = 2): ModeState => ({ [Mode.Land]: getDefaultMode(Mode.Land, participants), [Mode.Naval]: getDefaultMode(Mode.Naval, participants) })
