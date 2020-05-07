import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Mode, TacticType, UnitPreferences, UnitPreferenceType, dictionaryUnitType, dictionaryTacticType, GeneralAttribute, UnitType, UnitAttribute, CultureType, CountryName, CountryAttribute, SelectionType, Invention, ArmyName, CohortDefinition, GovermentType } from 'types'
import {
  enableGeneralSelections, createCountry, setCountryAttribute, selectCulture, enableCountrySelections, enableCountrySelection, createArmy, setHasGeneral, setGeneralAttribute,
  setFlankSize, setUnitPreference, selectTactic, addToReserve, deleteArmy, setMode, enableGeneralSelection
} from 'reducers'
import { Input, Button, Grid, Table, Header } from 'semantic-ui-react'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { sortBy, uniq, sum, union } from 'lodash'
import LabelItem from 'components/Utils/LabelUnit'
import { AppState, getUnits, getMode } from 'state'
import { getDefaultUnits, countries_ir, traditions_ir, heritages_ir, policies_ir, laws_ir, factions_ir, religions_ir, deities_ir, modifiers_ir, traits_ir, tech_ir, trades_ir, ideas_ir, abilities_ir } from 'data'
import AttributeImage from 'components/Utils/AttributeImage'
import { toObj, toArr, mapRange, map, values, keys, filter } from 'utils'
import { getNextId } from 'army_utils'
import { calculateValueWithoutLoss } from 'definition_values'
import { parseFile, binaryToPlain } from 'managers/importer'
import JSZip from 'jszip'

type Country = {
  id: string
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
  exports: boolean[]
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

type SaveTerritory = {
  trade_goods: TradeGood
  province_rank: 'settlement' | 'city'
  buildings: number[]
  pop: number[]
  state: number
}

type SaveCharacter = {
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

enum TradeGood {
  Dummy = 'Dummy'
}

type SaveRoute = {
  from_state: number
  to_state: number
  trade_goods: TradeGood
}

type SaveCountryDeity = {
  deity: number
}

type Character = {
  name: string
  martial: number
  traitMartial: number
  traits: string[]
}

type Army = {
  id: string
  name: ArmyName
  cohorts: Cohort[]
  mode: Mode
  tactic: TacticType
  preferences: UnitPreferences
  flankSize: number
  leader: Character | null
  ability: string
}

type Cohort = {
  type: UnitType
  [UnitAttribute.Morale]: number
  [UnitAttribute.Strength]: number
  [UnitAttribute.Experience]: number
}

type Save = { [key: string]: any } & {
  jobs: {
    office_job: SaveJob[],
    techoffice_job: SaveJob[],
    province_job: SaveJob[]
  }
  character: {
    character_database: { [key: number]: SaveCharacter }
  }
  provinces: { [key: number]: SaveTerritory }
  trade: {
    route: SaveRoute[]
  }
}

type IState = {
  country: Country | null
  armies: Army[]
  army: Army | null
  file: Save
}

class ImportSave extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { country: null, army: null, armies: [], file: {} as Save }
  }

  // Importing must be done in two steps. First to import definitions and then cohorts (since their values are relative to definitions).
  importing = false

  componentDidUpdate() {
    if (this.importing && this.state.country) {
      const countryName = this.state.country.name
      if (this.state.army)
        this.importArmyEnd(countryName, this.state.army)
      else
        this.state.armies.forEach(army => this.importArmyEnd(countryName, army))
    }
    this.importing = false
  }

  getTagName = (tag: string) => countries_ir[tag.toLowerCase()] ? countries_ir[tag.toLowerCase()] + ' (' + tag + ')' : tag

  getArmyName = (army: any) => {
    let name = army.name
    if (name.startsWith('RETINUE_ARMY_NAME'))
      name = 'Retinue'
    else if (name.startsWith('NAVY_NAME'))
      name = 'Navy'
    else
      name = 'Army'
    if (army.ordinal)
      name += ' ' + army.ordinal
    if (army.family)
      name += ' ' + army.family
    return name
  }

  getCountryImportString = () => {
    if (this.state.country) {
      if (this.state.army)
        return 'Import ' + this.state.country.name + ' and ' + this.state.army.name
      else
        return 'Import ' + this.state.country.name + ' and all armies'
    }
    return 'Import countries'
  }

  getArmyImportString = () => {
    if (this.state.country) {
      if (this.state.army)
        return 'Import ' + this.state.army.name
      else
        return 'Import all armies'
    }
    return 'Import only armies'
  }

  render() {
    const { country, army } = this.state
    const countries = this.getCountryList()
    const armies = this.getArmyList()
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column verticalAlign='middle'>
            <Header style={{ display: 'inline' }} >Select a save game to import </Header>
            <Input style={{ display: 'inline' }} type='file' onChange={event => this.loadContent(event.target.files![0])} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns='4'>
          <Grid.Column>
            <SimpleDropdown
              value={country?.id ?? ''}
              values={countries}
              clearable search
              onChange={countries.length ? this.selectCountry : undefined}
              placeholder='Select country'
            />
          </Grid.Column>
          <Grid.Column>
            <SimpleDropdown
              value={army?.id ?? ''}
              values={armies}
              clearable search
              onChange={armies.length ? this.selectArmy : undefined}
              placeholder='Select army'
            />
          </Grid.Column>
          <Grid.Column>
            <Button onClick={this.importCountry} disabled={!this.state.country}>{this.getCountryImportString()}</Button>
          </Grid.Column>
          <Grid.Column>
            <Button onClick={this.importArmy} disabled={!this.state.country || !this.props.countries[this.state.country.name]}>{this.getArmyImportString()}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Table>
              <Table.Body>
                {this.renderCountry()}
                {this.state.army ? this.renderArmy(this.state.army) : this.state.armies.map(this.renderArmy)}
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  renderCountry = () => {
    if (!this.state.country)
      return null
    const country = this.state.country
    return (
      <>
        <Table.Row>
          <Table.Cell>
            Country
          </Table.Cell>
          <Table.Cell>
            {country.name}
          </Table.Cell>
          <Table.Cell>
            Controller
          </Table.Cell>
          <Table.Cell>
            {country.isPlayer ? 'Player' : 'AI'}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Military tech
          </Table.Cell>
          <Table.Cell>
            {country.tech}
          </Table.Cell>
          <Table.Cell>
            Military inventions
          </Table.Cell>
          <Table.Cell>
            {country.inventions.filter(invention => invention).length}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Culture
          </Table.Cell>
          <Table.Cell>
            {traditions_ir[country.tradition]?.name}
          </Table.Cell>
          <Table.Cell>
            Heritage
          </Table.Cell>
          <Table.Cell>
            {heritages_ir[country.heritage]?.name}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Army
          </Table.Cell>
          <Table.Cell>
            {policies_ir.find(policy => policy.find(option => option.key === country.armyMaintenance))?.find(option => option.key === country.armyMaintenance)?.name}
          </Table.Cell>
          <Table.Cell>
            Navy
          </Table.Cell>
          <Table.Cell>
            {policies_ir.find(policy => policy.find(option => option.key === country.navalMaintenance))?.find(option => option.key === country.navalMaintenance)?.name}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Military experience
          </Table.Cell>
          <Table.Cell>
            {country.militaryExperience}
          </Table.Cell>
          <Table.Cell>
            Traditions
          </Table.Cell>
          <Table.Cell>
            {sum(country.traditions)}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Capital surplus
          </Table.Cell>
          <Table.Cell>
            {country.surplus.map(key => trades_ir['surplus_' + key]?.name.substr(8)).filter(value => value).join(', ')}
          </Table.Cell>
          <Table.Cell>
            Exports
          </Table.Cell>
          <Table.Cell>
            {this.getExports(country).map(key => trades_ir[key]?.name.substr(8)).filter(value => value).join(', ')}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Laws
          </Table.Cell>
          <Table.Cell>
            {country.laws.map(key => laws_ir[key]?.name).filter(value => value).join(', ')}
          </Table.Cell>
          <Table.Cell>
            Office (Discipline / Morale)
          </Table.Cell>
          <Table.Cell>
            {country.officeMorale || country.officeDiscipline}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Government
          </Table.Cell>
          <Table.Cell>
            {country.government}
          </Table.Cell>
          <Table.Cell>
            Faction
          </Table.Cell>
          <Table.Cell>
            {factions_ir[country.faction]?.name}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Religion
          </Table.Cell>
          <Table.Cell>
            {religions_ir[country.religion]?.name} ({country.religiousUnity.toPrecision(3)}%)
          </Table.Cell>
          <Table.Cell>
            Deities
          </Table.Cell>
          <Table.Cell>
            {country.deities.map(key => deities_ir[key] ? deities_ir[key].name + (country.omen.substr(4) === key.substr(5) ? ' (with omen)' : '') : null).filter(value => value).join(', ')}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Ideas
          </Table.Cell>
          <Table.Cell>
            {country.ideas.map(key => ideas_ir[key]?.name).filter(value => value).join(', ')}
          </Table.Cell>
          <Table.Cell>
            Modifiers
          </Table.Cell>
          <Table.Cell>
            {country.modifiers.map(key => modifiers_ir[key]?.name).filter(value => value).join(', ')}
          </Table.Cell>
        </Table.Row>
      </>
    )
  }

  renderArmy = (army: Army) => {
    const { tactics, units } = this.props
    const cohorts = army.cohorts.map(cohort => cohort.type)
    const types = uniq(cohorts)
    const counts = toObj(types, type => type, type => cohorts.filter(item => item === type).length)
    const ability = abilities_ir.find(abilities => abilities.find(ability => ability.key === army.ability))?.find((ability => ability.key === army.ability))?.name
    return (
      <React.Fragment key={army.id}>
        <Table.Row><Table.Cell /><Table.Cell /><Table.Cell /><Table.Cell /></Table.Row>
        <Table.Row>
          <Table.Cell>
            Name
          </Table.Cell>
          <Table.Cell colSpan='3'>
            {army.name}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {army.mode === Mode.Naval ? 'Adminal' : 'General'}
          </Table.Cell>
          <Table.Cell>
            {army.leader ? army.leader.name : ''}
          </Table.Cell>
          <Table.Cell>
            {army.leader ? <><AttributeImage attribute={GeneralAttribute.Martial} />{' ' + (army.leader.martial + army.leader.traitMartial)}</> : ''}
          </Table.Cell>
          <Table.Cell>
            {army.leader ? army.leader.traits.map(key => traits_ir[key]?.name).join(', ') : ''}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Tactic / Ability
            </Table.Cell>
          <Table.Cell>
            <LabelItem item={tactics[army.tactic]} />
            {ability ? ' / ' + ability : null}
          </Table.Cell>
          <Table.Cell>
            Flank size
          </Table.Cell>
          <Table.Cell>
            {army.flankSize}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Preferences
            </Table.Cell>
          <Table.Cell>
            <LabelItem item={units[army.preferences[UnitPreferenceType.Primary]!]} />
          </Table.Cell>
          <Table.Cell>
            <LabelItem item={units[army.preferences[UnitPreferenceType.Secondary]!]} />
          </Table.Cell>
          <Table.Cell>
            <LabelItem item={units[army.preferences[UnitPreferenceType.Flank]!]} />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Cohorts
          </Table.Cell>
          <Table.Cell colSpan='3'>
            {toArr(counts, (value, key) => <span key={key} style={{ paddingRight: '1em' }}><LabelItem item={units[key]} />{' x ' + value}</span>)}
          </Table.Cell>
        </Table.Row>
      </React.Fragment>
    )
  }

  selectCountry = (id: string) => {
    const country = id ? this.loadCountry(id) : null
    const armies = country && country.armies ? country.armies.map(id => this.loadArmy(String(id))) : []
    this.setState({ country, armies })
  }

  selectArmy = (id: string) => this.setState({ army: id ? this.loadArmy(id) : null })

  loadContent = (file: File) => {
    if (!file) {
      this.setState({ country: null, army: null, armies: [], file: {} as Save })
      return
    }
    new JSZip().loadAsync(file).then(zip => {
      const file = zip.file('gamestate')
      if (file) {
        file.async('uint8array').then(buffer => {
          const file = parseFile(binaryToPlain(buffer, false)[0]) as Save
          this.setState({ file })
        })
      }
    }).catch(() => {
      file.text().then(data => {
        const file = parseFile(data) as Save
        this.setState({ file })
      })
    })
  }

  getCountryList = () => {
    const data = this.state.file.country?.country_database
    if (data) {
      return keys(data).map(key => ({ text: this.getTagName(data[key].tag), value: key }))
    }
    return []
  }

  getArmyList = () => this.state.armies.map(army => ({ text: army.name, value: army.id }))

  loadCountry = (id: string) => {
    const deities = this.state.file.deity_manager?.deities_database
    const data = this.state.file.country?.country_database[id]
    const availableLaws = data.laws.map((value: any) => !!value)
    const country: Country = {
      armies: data.units,
      // Index 9 is Roman special invention, others are military inventions.
      // Probably need to check what other special inventions do.
      inventions: this.arrayify(data.active_inventions).filter((_, index) => index === 9 || (75 < index && index < 138)).map(value => !!value),
      heritage: data.heritage ?? '',
      militaryExperience: data?.currency_data.military_experience ?? 0,
      name: (countries_ir[data?.country_name.name.toLowerCase() ?? ''] ?? '') as CountryName,
      tech: data.technology?.military_tech?.level ?? 0,
      tradition: (data.military_tradition ?? '') as CultureType,
      armyMaintenance: 'expense_army_' + this.maintenanceToKey(data.economic_policies[4]),
      navalMaintenance: 'expense_navy_' + this.maintenanceToKey(data.economic_policies[5]),
      traditions: this.arrayify(data.military_tradition_levels).filter((_, index) => index < 3),
      laws: [],
      exports: this.arrayify(data.export).map((value: any) => !!value),
      surplus: [],
      ideas: this.arrayify(data.ideas?.idea).map((idea: any) => idea.idea),
      officeDiscipline: 0,
      officeMorale: 0,
      id,
      deities: deities ? this.arrayify(data.pantheon).map((deity: SaveCountryDeity) => deities[deity.deity].deity) : [],
      omen: deities && data.omen ? deities[data.omen].key : '',
      religiousUnity: data.religious_unity * 100 ?? 0,
      religion: data.religion ?? '',
      government: '' as GovermentType,
      faction: data.ruler_term?.party ?? '',
      modifiers: this.arrayify(data.modifier).map((modifier: any) => modifier.modifier),
      isPlayer: !!this.arrayify(this.state.file.played_country).find(player => player.country === Number(id))
    }
    if (this.state.file.game_configuration?.difficulty)
      country.modifiers.push(this.state.file.game_configuration.difficulty + (country.isPlayer ? '_player' : '_ai'))
    this.laws.filter((_, index) => availableLaws[index]).forEach(key => {
      country.laws.push(data[key])
    })
    const government = data.government_key ?? ''
    if (government.endsWith('republic'))
      country.government = GovermentType.Republic
    else if (government.endsWith('monarchy'))
      country.government = GovermentType.Monarch
    else
      country.government = GovermentType.Tribe

    const jobs = this.state.file.jobs?.office_job ?? []
    const characters = this.state.file.character?.character_database ?? {}
    const disciplineJob = jobs.find(job => job.who === Number(id) && job.office === 'office_tribune_of_the_soldiers')
    const moraleJob = jobs.find(job => job.who === Number(id) && job.office === 'office_master_of_the_guard')
    if (disciplineJob) {
      const character = characters[disciplineJob.character]
      country.officeDiscipline = Math.floor(this.getCharacterMartial(character) * character.character_experience / 100.0) / 2
    }
    if (moraleJob) {
      const character = characters[moraleJob.character]
      country.officeMorale = Math.floor(this.getCharacterMartial(character) * character.character_experience / 100.0)
    }
    const pops = this.state.file.population?.population
    if (data.capital && this.state.file.provinces && pops) {
      const province = this.state.file.provinces[data.capital]?.state ?? 0
      const territories = Object.values(this.state.file.provinces).filter(territory => territory.state === province)
      const goods = territories.reduce((prev, territory) => {
        const slaves = territory.pop.filter((id: number) => pops[id].type === 'slaves').length
        const goods = territory.trade_goods
        let slavesForSurplus = 18
        if (territory.province_rank === 'settlement')
          slavesForSurplus -= 3
        if (territory.buildings[16])
          slavesForSurplus -= 5
        if (territory.buildings[17])
          slavesForSurplus -= 5
        if (country.laws.includes('formalized_industry_law_tribal'))
          slavesForSurplus -= 1
        if (country.laws.includes('lex_sempronia_agraria'))
          slavesForSurplus -= 2
        if (country.laws.includes('republican_land_reform_3'))
          slavesForSurplus -= 2
        slavesForSurplus = Math.max(1, slavesForSurplus)
        return prev.concat(Array(1 + Math.floor(slaves / slavesForSurplus)).fill(goods))
      }, [] as TradeGood[])
      const counts = toObj(goods, type => type, type => goods.filter(item => item === type).length)
      const tradeRoutes = this.state.file.trade?.route ?? []
      tradeRoutes.forEach(route => {
        if (route.from_state === province)
          counts[route.trade_goods]--

        if (route.to_state === province)
          counts[route.trade_goods] = (counts[route.trade_goods] ?? 0) + 1

      })
      country.surplus = keys(filter(counts, item => item > 1))
    }

    return country
  }

  getCharacterMartial = (character: SaveCharacter) => character.attributes.martial + sum(this.arrayify(character.traits).map((key: string) => traits_ir[key]?.modifiers.find(modifier => modifier.attribute === GeneralAttribute.Martial)?.value ?? 0))

  getCharacterName = (character: SaveCharacter) => character.first_name_loc.name + (character.family_name ? ' ' + character.family_name : '')

  arrayify = (data: any) => data ? (Array.isArray(data) ? data : [data]) : []

  laws = [
    'succession_law',
    'monarchy_military_reforms',
    'monarchy_maritime_laws',
    'monarchy_economic_law',
    'monarchy_citizen_law',
    'monarchy_religious_laws',
    'monarchy_legitimacy_laws',
    'monarchy_contract_law',
    'monarchy_divinity_statutes',
    'monarchy_subject_laws',
    'republic_military_recruitment_laws',
    'republic_election_reforms',
    'corruption_laws',
    'republican_mediterranean_laws',
    'republican_religious_laws',
    'republic_integration_laws',
    'republic_citizen_laws',
    'republican_land_reforms',
    'republic_military_recruitment_laws_rom',
    'republic_election_reforms_rom',
    'corruption_laws_rom',
    'republican_mediterranean_laws_rom',
    'republican_religious_laws_rom',
    'republic_integration_laws_rom',
    'republic_citizen_laws_rom',
    'republican_land_reforms_rom',
    'tribal_religious_law',
    'tribal_currency_laws',
    'tribal_centralization_law',
    'tribal_authority_laws',
    'tribal_autonomy_laws',
    'tribal_domestic_laws',
    'tribal_decentralized_laws',
    'tribal_centralized_laws',
    'tribal_super_decentralized_laws',
    'tribal_super_centralized_laws'
  ]

  loadCharacter = (id: number): Character => {
    const character = this.state.file.character.character_database[id]
    return {
      martial: character.attributes.martial,
      traitMartial: this.getCharacterMartial(character) - character.attributes.martial,
      name: this.getCharacterName(character),
      traits: character.traits ?? []
    }
  }

  loadCohort = (id: number): Cohort => {
    const cohort = this.state.file.armies.subunit_database[id]
    return {
      [UnitAttribute.Experience]: cohort.experience,
      [UnitAttribute.Morale]: cohort.morale,
      [UnitAttribute.Strength]: cohort.strength,
      type: dictionaryUnitType[cohort.type]
    }
  }

  loadArmy = (id: string) => {
    const data = this.state.file.armies?.units_database[id]
    const army: Army = {
      id,
      name: this.getArmyName(data.unit_name) as ArmyName,
      cohorts: (data.cohort ?? data.ship) ? this.arrayify(data.cohort ?? data.ship).map(id => this.loadCohort(id)) : [],
      flankSize: data.flank_size,
      leader: data.leader ? this.loadCharacter(data.leader) : null,
      mode: data.is_army === 'yes' ? Mode.Land : Mode.Naval,
      preferences: {
        [UnitPreferenceType.Primary]: dictionaryUnitType[data.primary],
        [UnitPreferenceType.Secondary]: dictionaryUnitType[data.second],
        [UnitPreferenceType.Flank]: dictionaryUnitType[data.flank]
      } as UnitPreferences,
      tactic: dictionaryTacticType[data.tactic],
      ability: data.unit_ability?.which ?? ''
    }
    return army
  }

  maintenanceToKey = (value: number) => {
    switch (value) {
      case 1:
        return 'high'
      case -1:
        return 'low'
      default:
        return 'default'
    }
  }

  importCountry = () => {
    const { createCountry, setCountryAttribute, selectCulture, enableCountrySelections, enableCountrySelection } = this.props
    const country = this.state.country
    if (!country)
      return

    this.importing = true
    const countryName = country.name
    createCountry(countryName)
    setCountryAttribute(countryName, CountryAttribute.TechLevel, country.tech)
    setCountryAttribute(countryName, CountryAttribute.MilitaryExperience, country.militaryExperience)
    selectCulture(countryName, country.tradition, false)
    const traditionsWithBonus = country.traditions.map(value => value === 7 ? 8 : value)
    const traditions = union(...traditionsWithBonus.map((value, index) => (
      mapRange(value, value => 'tradition_path_' + index + '_' + value)
    )))
    enableCountrySelections(countryName, SelectionType.Tradition, traditions)
    const invention_list = sortBy(tech_ir.reduce((prev, curr) => prev.concat(curr.inventions.filter(invention => invention.index)), [] as Invention[]), invention => invention.index)
    const inventions = country.inventions.map((value, index) => value && index ? invention_list[index - 1].key : '').filter(value => value)
    const exports = this.getExports(country)
    const imports = country.surplus.map(key => 'surplus_' + key)
    enableCountrySelections(countryName, SelectionType.Invention, inventions)
    enableCountrySelection(countryName, SelectionType.Heritage, country.heritage)
    enableCountrySelections(countryName, SelectionType.Trade, exports)
    enableCountrySelections(countryName, SelectionType.Trade, imports)
    enableCountrySelections(countryName, SelectionType.Idea, country.ideas)
    enableCountrySelections(countryName, SelectionType.Law, country.laws)
    enableCountrySelections(countryName, SelectionType.Deity, country.deities)
    if (country.omen)
      enableCountrySelection(countryName, SelectionType.Deity, 'omen' + country.omen)
    enableCountrySelections(countryName, SelectionType.Modifier, country.modifiers)
    enableCountrySelection(countryName, SelectionType.Policy, country.armyMaintenance)
    enableCountrySelection(countryName, SelectionType.Policy, country.navalMaintenance)
    enableCountrySelection(countryName, SelectionType.Religion, country.religion)
    enableCountrySelection(countryName, SelectionType.Faction, country.faction)
    setCountryAttribute(countryName, CountryAttribute.OfficeDiscipline, country.officeDiscipline)
    setCountryAttribute(countryName, CountryAttribute.OfficeMorale, country.officeMorale)
    setCountryAttribute(countryName, CountryAttribute.OmenPower, country.religiousUnity - 100)
    this.importArmy()
  }

  getExports = (country: Country) => {
    const exports = sortBy(values(trades_ir).filter(entity => entity.index), entity => entity.index)
    return country.exports.map((value, index) => value ? exports.find(entity => entity.index === index)?.key ?? '' : '').filter(value => value)
  }

  importArmy = () => {
    if (!this.state.country)
      return
    this.importing = true
    const countryName = this.state.country.name
    if (this.state.army)
      this.importArmyStart(countryName, this.state.army)
    else
      this.state.armies.forEach(army => this.importArmyStart(countryName, army))
  }

  importArmyStart = (countryName: CountryName, army: Army) => {
    const { createArmy, deleteArmy, setHasGeneral, setGeneralAttribute, enableGeneralSelections, setFlankSize, setUnitPreference, selectTactic, mode, setMode, enableGeneralSelection } = this.props
    const armyName = army.name
    // Country must have at least one army per mode so only delete the default one if importing anything.
    if (army.mode === Mode.Land)
      deleteArmy(countryName, ArmyName.Army)
    else
      deleteArmy(countryName, ArmyName.Navy)
    createArmy(countryName, armyName, army.mode)
    if (mode !== army.mode)
      setMode(army.mode)
    if (army.leader) {
      setGeneralAttribute(countryName, armyName, GeneralAttribute.Martial, army.leader.martial)
      enableGeneralSelection(countryName, armyName, SelectionType.Ability, army.ability)
      enableGeneralSelections(countryName, armyName, SelectionType.Trait, army.leader.traits)
    } else {
      setHasGeneral(countryName, armyName, false)
    }
    setFlankSize(countryName, armyName, army.flankSize)
    selectTactic(countryName, armyName, army.tactic)
    setUnitPreference(countryName, armyName, UnitPreferenceType.Primary, army.preferences[UnitPreferenceType.Primary])
    setUnitPreference(countryName, armyName, UnitPreferenceType.Secondary, army.preferences[UnitPreferenceType.Secondary])
    setUnitPreference(countryName, armyName, UnitPreferenceType.Flank, army.preferences[UnitPreferenceType.Flank])
    if (mode !== army.mode)
      setMode(mode)
  }

  importArmyEnd = (countryName: CountryName, army: Army) => {
    const { state, addToReserve, mode, setMode } = this.props
    const armyName = army.name
    const units = getUnits(state, countryName, armyName, army.mode)
    const experiences = map(units, unit => calculateValueWithoutLoss(unit, UnitAttribute.Experience))
    const maxStrengths = map(units, unit => calculateValueWithoutLoss(unit, UnitAttribute.Strength))
    const maxMorales = map(units, unit => calculateValueWithoutLoss(unit, UnitAttribute.Morale))
    const cohorts: CohortDefinition[] = army.cohorts.map(cohort => ({
      type: cohort.type,
      id: getNextId(),
      base_values: {
        [UnitAttribute.Experience]: {
          'Custom': cohort[UnitAttribute.Experience] - experiences[cohort.type]
        }
      } as any,
      loss_values: {
        [UnitAttribute.Morale]: {
          'Custom': maxMorales[cohort.type] - cohort[UnitAttribute.Morale]
        },
        [UnitAttribute.Strength]: {
          'Custom': maxStrengths[cohort.type] - cohort[UnitAttribute.Strength]
        }
      } as any
    }))
    if (mode !== army.mode)
      setMode(army.mode)
    addToReserve(countryName, armyName, cohorts)
    if (mode !== army.mode)
      setMode(mode)
  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics,
  countries: state.countries,
  units: getDefaultUnits(),
  state,
  mode: getMode(state)
})

const actions = {
  createCountry, setCountryAttribute, selectCulture, enableCountrySelections, enableCountrySelection, createArmy, setHasGeneral, setGeneralAttribute, enableGeneralSelections,
  setFlankSize, setUnitPreference, selectTactic, addToReserve, deleteArmy, setMode, enableGeneralSelection
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ImportSave)
