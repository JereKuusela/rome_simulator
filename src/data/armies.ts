import { Mode, Army, TacticType, UnitPreferences, UnitPreferenceType, UnitType, Armies, ArmyName } from "types"


const getDefaultTactic = (mode: Mode): TacticType => mode === Mode.Land ? TacticType.Deception : TacticType.FrontalAssault

const getDefaultUnitPreferences = (mode: Mode): UnitPreferences => {
  if (mode === Mode.Naval) {
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
  frontline: {},
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

const defaultLandArmy = initializeDefaultArmy(Mode.Land)
const defaultNavalArmy = initializeDefaultArmy(Mode.Naval)

export const getDefaultArmy = (mode: Mode): Army => {
  if (mode === Mode.Naval)
    return defaultNavalArmy
  return defaultLandArmy
}

export const getDefaultArmies = (): Armies => ({
  [Mode.Land]: {
    [ArmyName.Army1]: defaultLandArmy
  },
  [Mode.Naval]: {
    [ArmyName.Army1]: defaultNavalArmy
  }
})
