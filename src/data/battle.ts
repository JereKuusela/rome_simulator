import { Mode } from "types/definition"
import { Battle, CountryName, SideType, ModeState, TerrainType, Participant, ArmyName, SideData } from "types"
import { mapRange } from "utils"

export const getInitialTerrains = (mode: Mode): TerrainType[] => {
  if (mode === Mode.Naval)
    return [TerrainType.Ocean]
  else
    return [TerrainType.None, process.env.REACT_APP_GAME === 'EU4' ? TerrainType.Grasslands : TerrainType.Plains]
}

export const getDefaultSide = (type: SideType, name: CountryName, mode: Mode, participants: number): SideData => {
  return {
    type,
    participants: mapRange(participants, () => getDefaultParticipant(name, mode)),
    days: [],
    rolls: [0],
    dice: (process.env.REACT_APP_GAME === 'EU4' ? 5 : 3),
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

export const getDefaultMode = (mode: Mode, participants: number = 1): Battle => ({
  sides: { [SideType.A]: getDefaultSide(SideType.A, CountryName.Country1, mode, participants), [SideType.B]: getDefaultSide(SideType.B, CountryName.Country2, mode, participants) },
  terrains: getInitialTerrains(mode),
  fightOver: true,
  seed: 0,
  customSeed: undefined,
  outdated: true,
  timestamp: 0,
  days: []
})

export const getDefaultBattle = (participants: number = 1): ModeState => ({ [Mode.Land]: getDefaultMode(Mode.Land, participants), [Mode.Naval]: getDefaultMode(Mode.Naval, participants) })
