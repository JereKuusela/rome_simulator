import { Mode, ArmyData, TacticType, UnitPreferences, UnitPreferenceType, UnitType, Armies, ArmyName, UnitRole, Selections } from 'types'

const getDefaultTactic = (mode: Mode): TacticType => mode === Mode.Land ? TacticType.Deception : TacticType.FrontalAssault

const getDefaultUnitPreferences = (mode: Mode): UnitPreferences => {
  if (process.env.REACT_APP_GAME === 'euiv') {
    return {
      [UnitRole.Front]: UnitType.Latest,
      [UnitRole.Flank]: UnitType.Latest,
      [UnitRole.Support]: UnitType.Latest
    } as UnitPreferences
  }
  if (mode === Mode.Naval) {
    return {
      [UnitPreferenceType.Primary]: UnitType.MegaPolyreme,
      [UnitPreferenceType.Secondary]: UnitType.MegaPolyreme,
      [UnitPreferenceType.Flank]: UnitType.MegaPolyreme
    } as UnitPreferences
  }
  else {
    return {
      [UnitPreferenceType.Primary]: UnitType.Archers,
      [UnitPreferenceType.Secondary]: UnitType.HeavyInfantry,
      [UnitPreferenceType.Flank]: UnitType.LightCavalry
    } as UnitPreferences
  }
}

const initializeDefaultArmy = (mode: Mode): ArmyData => ({
  reserve: [],
  unitPreferences: getDefaultUnitPreferences(mode),
  flankSize: 5,
  general: {
    enabled: true,
    selections: {} as Selections,
    definitions: {} as any,
    tactic: getDefaultTactic(mode)
  },
  mode
})

const defaultLandArmy = initializeDefaultArmy(Mode.Land)
const defaultNavalArmy = initializeDefaultArmy(Mode.Naval)

export const getDefaultArmy = (mode: Mode): ArmyData => {
  if (mode === Mode.Naval)
    return defaultNavalArmy
  return defaultLandArmy
}

export const getDefaultArmies = (): Armies => ({
  [ArmyName.Army]: defaultLandArmy,
  [ArmyName.Navy]: defaultNavalArmy
})
