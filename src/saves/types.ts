import { ArmyName, CountryName, GovermentType, Mode, TacticType, UnitAttribute, UnitPreferences, UnitType } from 'types'
import { laws } from 'data'
import { DataEntry } from '../types/modifiers'

export type SaveCountry = {
  id: number
  name: CountryName
  religion: string
  government: GovermentType
  faction: string
  traditions: DataEntry[]
  heritage: string
  martialTech: number
  oratoryTech: number
  civicTech: number
  religiousTech: number
  armies: number[]
  culture: string
  inventions: DataEntry[]
  militaryExperience: number
  armyMaintenance: string
  navalMaintenance: string
  religiousUnity: number
  laws: string[]
  ideas: string[]
  surplus: TradeGood[]
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
type ProvinceJob = {
  who: number
  character: number
  governorship: string
  start_date: string
}

type PopType = 'nobles' | 'citizen' | 'freemen' | 'tribesmen' | 'slaves'

export type SavePop = {
  type: PopType
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

type SaveProvince = {
  area: string
  cached_food_storage: number
  capital: number
  culture: number
  food_value: number
  governor_policy: string
  max_food_value: number
  religion: number
  state_loyalty: number
  variables: []
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

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer ElementType> ? ElementType : never

type SaveDataCountry = Record<ElementType<typeof laws>, string> & {
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
    civic_tech?: {
      level: number
    }
    military_tech?: {
      level: number
    }
    oratory_tech?: {
      level: number
    }
    religious_tech?: {
      level: number
    }
  }
  primary_culture: string
  economic_policies: number[]
  military_bonuses: number[]
  ideas?: {
    idea: {
      idea: string[]
    }[]
  }
  governorship: []
  pantheon: SaveCountryDeity[]
  omen: number
  religious_unity: number
  religion?: string
  ruler_term?: {
    character: number
    government: string
    party?: string
    start_date: string
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

type SaveCulture = {
  culture: string
  pop_type: PopType
  country: number
  progress: number
  pop_count: number
  integration_status: 'integrated' | undefined
}

export type Save = Record<string, unknown> & {
  jobs?: {
    office_job: SaveJob[]
    techoffice_job: SaveJob[]
    province_job: ProvinceJob[]
  }
  character?: {
    character_database: Record<number, SaveCharacter>
  }
  provinces?: Record<number, SaveTerritory>
  states?: Record<number, SaveProvince>
  trade?: {
    route: SaveRoute[]
  }
  armies?: {
    subunit_database: Record<number, SaveDataCohort>
    units_database: Record<number, SaveDataArmy>
  }
  deity_manager?: {
    deities_database: Record<number, { deity: string; key: string }>
  }
  country?: {
    country_database: Record<number, SaveDataCountry>
  }
  played_country?: {
    country: number
  }[]
  diplomacy?: {
    database: Record<number, SaveDataWar>
  }
  population?: {
    population: Record<number, SavePop>
  }
  game_configuration?: {
    difficulty: string
  }
  country_culture_manager?: {
    country_culture_database: Record<number, SaveCulture>
  }
}
