import { Mode, Army, DefinitionType, TacticType, UnitPreferences, UnitPreferenceType, UnitType, Armies, ArmyName } from "types"


const getDefaultTactic = (mode: Mode): TacticType => mode === DefinitionType.Land ? TacticType.Deception : TacticType.FrontalAssault

const getDefaultUnitPreferences = (mode: Mode): UnitPreferences => {
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
  tactic: getDefaultTactic(mode),
  unit_preferences: getDefaultUnitPreferences(mode),
  flank_size: 5,
  general: {
    enabled: true,
    definitions: {} as any
  }
})

const defaultLandArmy = initializeDefaultArmy(DefinitionType.Land)
const defaultNavalArmy = initializeDefaultArmy(DefinitionType.Naval)

export const getDefaultArmy = (mode: Mode): Army => {
  if (mode === DefinitionType.Naval)
    return defaultNavalArmy
  return defaultLandArmy
}

export const getDefaultArmies = (): Armies => ({
  [DefinitionType.Land]: {
    [ArmyName.Army1]: defaultLandArmy
  },
  [DefinitionType.Naval]: {
    [ArmyName.Army1]: defaultNavalArmy
  }
})
