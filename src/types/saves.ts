import { ArmyName, CountryName, CultureType, GovermentType, Mode, TacticType, UnitAttribute, UnitPreferences, UnitType } from "types"
import { laws } from 'data'

export type SaveCountry = {
  id: number
  name: CountryName
  tradition: CultureType
  religion: string
  government: GovermentType
  faction: string
  traditions: number[]
  heritage: string
  tech: number
  armies: number[]
  inventions: boolean[]
  militaryExperience: number
  armyMaintenance: string
  navalMaintenance: string
  religiousUnity: number
  laws: string[]
  ideas: string[]
  surplus: TradeGood[]
  officeDiscipline: number
  officeMorale: number
  deities: string[]
  modifiers: string[]
  isPlayer: boolean
  omen: string
}

type SaveJob = {
  who: number
  character: number
  office: string
}

export type SavePop = {
  type: 'citizen' | 'slaves' | 'nobles' | 'tribesmen' | 'freemen'
  culture: string
  religion: string
}

export type Territory = {
  id: string
  name: string
  controller: number
  totalPops: number
  pops: { [key: string]: number }
  rank: string
}

type SaveTerritory = {
  trade_goods: TradeGood
  province_rank: 'settlement' | 'city'
  buildings: number[]
  pop: number[]
  state: number
  owner: number
  controller: number
  province_name: {
    name: string
  }
}

export type SaveCharacter = {
  character_experience: number
  attributes: {
    martial: number
    finesse: number
    charisma: number
    zeal: number
  }
  first_name_loc: {
    name: string
  }
  family_name: string
  traits: string[]
}

export enum TradeGood {
  Dummy = 'Dummy'
}

type SaveRoute = {
  from_state: number
  to_state: number
  trade_goods: TradeGood
}

export type SaveCountryDeity = {
  deity: number
}

export type Character = {
  name: string
  martial: number
  traitMartial: number
  traits: string[]
}

export type SaveArmy = {
  id: number
  name: ArmyName
  cohorts: SaveCohort[]
  mode: Mode
  tactic: TacticType
  preferences: UnitPreferences
  flankSize: number
  leader: Character | null
  ability: string
}

export type SaveCohort = {
  type: UnitType
  [UnitAttribute.Morale]: number
  [UnitAttribute.Strength]: number
  [UnitAttribute.Experience]: number
}

type SaveDataCohort = {
  type: string
  experience: number
  morale: number
  strength: number
}

export type SaveDataUnitName = {
  name: string
  ordinal?: string
  family?: string
}

type SaveDataArmy = {
  unit_name: SaveDataUnitName
  flank_size: number
  cohort?: number
  ship?: number
  leader?: number
  is_army: 'yes' | 'no'
  primary: string
  second: string
  flank: string
  tactic: string
  unit_ability?: {
    which?: string
  }
}

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never

type SaveDataCountry = { [key in ElementType<typeof laws>]: string } & {
  laws?: number[]
  units: number[]
  active_inventions: number[]
  heritage?: string
  currency_data?: {
    military_experience: number
  }
  country_name?: {
    name: string
  }
  technology?: {
    military_tech?: {
      level: number
    }
  }
  military_tradition?: string
  economic_policies: number[]
  military_tradition_levels: number[]
  ideas?: {
    idea: {
      idea: string[]
    }[]
  }
  pantheon: SaveCountryDeity[]
  omen: number
  religious_unity: number
  religion?: string
  ruler_term?: {
    party?: string
  }
  modifier: {
    modifier: string
  }[]
  government_key?: string
  capital?: number
  tag: string
}

type SaveDataWar = {
  war_name: {
    name: string
    ordinal: number
    first: {
      name: string
    }
    second: {
      name: string
    }
  }
  attacker: number[]
  defender: number[]
}

export type Save = { [key: string]: any } & {
  jobs?: {
    office_job: SaveJob[],
    techoffice_job: SaveJob[],
    province_job: SaveJob[]
  }
  character?: {
    character_database: { [key: number]: SaveCharacter }
  }
  provinces?: { [key: number]: SaveTerritory }
  trade?: {
    route: SaveRoute[]
  }
  armies?: {
    subunit_database: { [key: number]: SaveDataCohort }
    units_database: { [key: number]: SaveDataArmy }
  }
  deity_manager?: {
    deities_database: { [key: number]: { deity: string, key: string } }
  }
  country?: {
    country_database: { [key: number]: SaveDataCountry }
  },
  played_country?: {
    country: number
  }[],
  diplomacy?: {
    database: { [key: number]: SaveDataWar }
  },
  population?: {
    population: { [key: number]: SavePop }
  }
}
