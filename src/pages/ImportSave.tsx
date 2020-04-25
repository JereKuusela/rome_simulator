import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Mode, TacticType, UnitPreferences, UnitPreferenceType, dictionaryUnitType, dictionaryTacticType, GeneralAttribute, UnitType, UnitAttribute, CultureType, CountryName, CountryAttribute, SelectionType, Invention, ArmyName, CohortDefinition, GovermentType } from 'types'
import {
  enableGeneralSelections, createCountry, setCountryAttribute, selectCulture, enableCountrySelections, enableCountrySelection, createArmy, setHasGeneral, setGeneralAttribute,
  setFlankSize, setUnitPreference, selectTactic, addToReserve, deleteArmy, setMode
} from 'reducers'
import { Input, Button, Grid, Table } from 'semantic-ui-react'
import Dropdown from 'components/Dropdowns/Dropdown'
import { sortBy, uniq, sum, union } from 'lodash'
import LabelItem from 'components/Utils/LabelUnit'
import { AppState, getUnits, getMode } from 'state'
import { getDefaultUnits } from 'data'
import AttributeImage from 'components/Utils/AttributeImage'
import { toObj, toArr, mapRange, map } from 'utils'
import { heritages_ir, traits_ir, traditions_ir, tech_ir, trades_ir, laws_ir, policies_ir, countries_ir, deities_ir, religions_ir, factions_ir } from 'managers/modifiers'
import { getNextId } from 'army_utils'
import { calculateValueWithoutLoss } from 'definition_values'

type Entry<T extends Tag | Army> = {
  entity: T
  start: number
  end: number
}

type Tag = {
  tag: string
  id: number
}

type Job = {
  character: number
  office: string
}

type Jobs = { [key: number]: { officeDiscipline: number, officeMorale: number } }
type Deities = { [key: number]: string }

type Country = {
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
  availableLaws: boolean[]
  religiousUnity: number
  laws: string[]
  ideas: string[]
  exports: boolean[]
  imports: boolean[]
  officeDiscipline: number
  officeMorale: number
  deities: string[]
}

type Character = {
  name: string
  martial: number
  traitMartial: number
  experience: number
  traits: string[]
}

type Army = {
  name: ArmyName
  cohorts: Cohort[]
  mode: Mode
  tactic: TacticType
  preferences: UnitPreferences
  flankSize: number
  leader: Character | null

}

type Cohort = {
  type: UnitType
  [UnitAttribute.Morale]: number
  [UnitAttribute.Strength]: number
  [UnitAttribute.Experience]: number
}

type IState = {
  countries: Entry<Tag>[]
  country: string
  armies: Entry<Army>[]
  army: string
}

type Bookmarks = { [key: string]: { start: number, end: number } }

class ImportSave extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { countries: [], country: '', army: '', armies: [] }
  }

  // Jobs and deities are cached so that they don't have to be reloaded whenever a country is chosen.
  jobs: Jobs = {}
  deities: Deities = {}
  lines: string[] = []
  bookmarks: Bookmarks = {}
  country: Country | null = null
  // Importing must be done in two steps. First to import definitions and then cohorts (since their values are relative to definitions).
  importing = false


  getArmy = (index?: string) => index ?? this.state.army ? this.state.armies[Number(index ?? this.state.army)].entity : null

  componentDidUpdate() {
    if (this.importing && this.country) {
      const countryName = this.country.name
      if (this.state.army)
        this.importArmyEnd(countryName, this.state.army)
      else
        this.state.armies.forEach((_, index) => this.importArmyEnd(countryName, String(index)))
    }
    this.importing = false
  }

  getTagName = (tag: string) => countries_ir[tag.toLowerCase()] + ' (' + tag + ')'

  getCountryImportString = () => {
    if (this.country) {
      if (this.state.army)
        return 'Import ' + this.country.name + ' and ' + this.getArmy()?.name
      else
        return 'Import ' + this.country.name + ' and all armies'
    }
    return 'Import countries'
  }

  getArmyImportString = () => {
    if (this.country) {
      if (this.state.army)
        return 'Import ' + this.getArmy()?.name
      else
        return 'Import all armies'
    }
    return 'Import only armies'
  }

  render() {
    const { countries, country, army, armies } = this.state
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column>
            <Input type='file' onChange={event => this.loadContent(event.target.files![0])} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns='4'>
          <Grid.Column>
            <Dropdown
              value={country}
              values={countries.map((entry, index) => ({ text: this.getTagName(entry.entity.tag), value: String(index) }))}
              clearable search
              onChange={countries.length ? this.selectCountry : undefined}
              placeholder='Select country'
            />
          </Grid.Column>
          <Grid.Column>
            <Dropdown
              value={army}
              values={armies.map((entry, index) => ({ text: entry.entity.name, value: String(index) }))}
              clearable search
              onChange={armies.length ? this.selectArmy : undefined}
              placeholder='Select army'
            />
          </Grid.Column>
          <Grid.Column>
            <Button onClick={this.importCountry} disabled={!this.country}>{this.getCountryImportString()}</Button>
          </Grid.Column>
          <Grid.Column>
            <Button onClick={this.importArmy} disabled={!this.country || !this.props.countries[this.country.name]}>{this.getArmyImportString()}</Button>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Table>
              <Table.Body>
                {this.renderCountry()}
                {this.state.army ? this.renderArmy(this.state.army) : this.state.armies.map((_, index) => this.renderArmy(String(index)))}
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  renderCountry = () => {
    const entity = this.country
    if (!entity)
      return null
    return (
      <>
        <Table.Row>
          <Table.Cell>
            Military tech
          </Table.Cell>
          <Table.Cell>
            {entity.tech}
          </Table.Cell>
          <Table.Cell>
            Military inventions
          </Table.Cell>
          <Table.Cell>
            {entity.inventions.filter(invention => invention).length}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Culture
          </Table.Cell>
          <Table.Cell>
            {traditions_ir[entity.tradition]?.name}
          </Table.Cell>
          <Table.Cell>
            Heritage
          </Table.Cell>
          <Table.Cell>
            {heritages_ir.find(heritage => heritage.key === entity.heritage)?.name}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Army
          </Table.Cell>
          <Table.Cell>
            {policies_ir.find(policy => policy.find(option => option.key === entity.armyMaintenance))?.find(option => option.key === entity.armyMaintenance)?.name}
          </Table.Cell>
          <Table.Cell>
            Navy
          </Table.Cell>
          <Table.Cell>
            {policies_ir.find(policy => policy.find(option => option.key === entity.navalMaintenance))?.find(option => option.key === entity.navalMaintenance)?.name}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Military experience
          </Table.Cell>
          <Table.Cell>
            {entity.militaryExperience}
          </Table.Cell>
          <Table.Cell>
            Traditions
          </Table.Cell>
          <Table.Cell>
            {sum(entity.traditions)}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Imports
          </Table.Cell>
          <Table.Cell>
            Not implemented
          </Table.Cell>
          <Table.Cell>
            Exports
          </Table.Cell>
          <Table.Cell>
            {entity.exports.filter(value => value).length}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Laws
          </Table.Cell>
          <Table.Cell>
            {entity.laws.map(key => laws_ir.find(law => key === law.key)?.name).filter(value => value).join(', ')}
          </Table.Cell>
          <Table.Cell>
            Office (Discipline / Morale)
          </Table.Cell>
          <Table.Cell>
            {entity.officeMorale || entity.officeDiscipline}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Government
          </Table.Cell>
          <Table.Cell>
            {entity.government}
          </Table.Cell>
          <Table.Cell>
            Faction
          </Table.Cell>
          <Table.Cell>
            {factions_ir.find(faction => faction.key === entity.faction)?.name}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Religion
          </Table.Cell>
          <Table.Cell>
            {religions_ir.find(religion => religion.key === entity.religion)?.name} ({entity.religiousUnity.toPrecision(3)}%)
          </Table.Cell>
          <Table.Cell>
            Deities
          </Table.Cell>
          <Table.Cell>
            {entity.deities.map(key => deities_ir.find(deity => key === deity.key)?.name).filter(value => value).join(', ')}
          </Table.Cell>
        </Table.Row>
      </>
    )
  }

  renderArmy = (id: string) => {
    const { tactics, units } = this.props
    const entity = this.state.armies[Number(id)].entity
    if (!entity)
      return null
    const cohorts = entity.cohorts.map(cohort => cohort.type)
    const types = uniq(cohorts)
    const counts = toObj(types, type => type, type => cohorts.filter(item => item === type).length)
    return (
      <React.Fragment key={id}>
        <Table.Row><Table.Cell /><Table.Cell /><Table.Cell /><Table.Cell /></Table.Row>
        <Table.Row>
          <Table.Cell>
            Name
          </Table.Cell>
          <Table.Cell colSpan='3'>
            {entity.name}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            {entity.mode === Mode.Naval ? 'Adminal' : 'General'}
          </Table.Cell>
          <Table.Cell>
            {entity.leader ? entity.leader.name : ''}
          </Table.Cell>
          <Table.Cell>
            {entity.leader ? <><AttributeImage attribute={GeneralAttribute.Martial} />{' ' + (entity.leader.martial + entity.leader.traitMartial)}</> : ''}
          </Table.Cell>
          <Table.Cell>
            {entity.leader ? entity.leader.traits.map(trait => traits_ir.find(item => item.key === trait)?.name).join(', ') : ''}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Tactic
            </Table.Cell>
          <Table.Cell>
            <LabelItem item={tactics[entity.tactic]} />
          </Table.Cell>
          <Table.Cell>
            Flank size
          </Table.Cell>
          <Table.Cell>
            {entity.flankSize}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Preferences
            </Table.Cell>
          <Table.Cell>
            <LabelItem item={units[entity.preferences[UnitPreferenceType.Primary]!]} />
          </Table.Cell>
          <Table.Cell>
            <LabelItem item={units[entity.preferences[UnitPreferenceType.Secondary]!]} />
          </Table.Cell>
          <Table.Cell>
            <LabelItem item={units[entity.preferences[UnitPreferenceType.Flank]!]} />
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

  selectCountry = (index: string) => {
    if (index) {
      const tag = this.state.countries[Number(index)]
      this.country = this.loadCountry(this.lines, tag)
      const armies = this.loadArmies(this.lines, this.bookmarks['units_database'].start, this.bookmarks['units_database'].end, this.country.armies)
      this.setState({ country: index, armies, army: '' })
    } else {
      this.country = null
      this.setState({ country: index, armies: [], army: '' })
    }
  }

  selectArmy = (index: string) => this.setState({ army: index })

  loadContent = (file: File) => {
    const blob = file as any
    if (!blob) {
      this.setState({ countries: [], country: '', army: '', armies: [] })
      return
    }
    blob.text().then((data: string) => {
      this.lines = data.split(/\r?\n/)
      this.loadCountries(this.lines, this.bookmarks)
    })
  }

  loadCountries = (lines: string[], bookmarks: Bookmarks) => {
    let countries: Entry<Tag>[] = []
    let previousKey = ''
    for (let line = 0; line < lines.length; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'tag') {
        const start = line
        line = this.findEndOfSection(lines, line)
        countries.push({
          entity: {
            tag: this.nonStringify(value),
            id: Number(previousKey)
          },
          start,
          end: line
        })
      }
      if (key === 'subunit_database' || key === 'units_database' || key === 'character_database' || key === 'provinces') {
        const start = line
        line = this.findEndOfSection(lines, line)
        bookmarks[key] = { start, end: line }
      }
      if (key === 'jobs')
        line = this.loadJobs(lines, line)
      if (key === 'deities_database')
        line = this.loadDeities(lines, line)
      previousKey = key
    }
    countries = sortBy(countries, entry => entry.entity.tag)
    this.setState({ countries })
  }

  loadJobs = (lines: string[], start: number) => {
    let line = start + 2
    for (; line < lines.length; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key !== 'who') {
        // To get back to end of section.
        line -= 1
        break
      }
      const id = Number(value)
      if (!this.jobs[id]) {
        this.jobs[id] = {
          officeDiscipline: 0,
          officeMorale: 0
        }
      }
      const job = this.loadJob(lines, line)
      if (job) {
        if (job.office === 'office_tribune_of_the_soldiers')
          this.jobs[id].officeDiscipline = job.character
        if (job.office === 'office_master_of_the_guard')
          this.jobs[id].officeMorale = job.character
      }
      // Assumes that jobs are 6 line blocks.
      line += 5
    }
    return line
  }

  loadJob = (lines: string[], start: number) => {
    const job: Job = {
      character: 0,
      office: ''
    }
    for (let line = start + 1; line < lines.length; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'character')
        job.character = Number(value)
      if (key === 'technology' || key === 'office') {
        const office = this.nonStringify(value)
        if (office !== 'office_tribune_of_the_soldiers' && office !== 'office_master_of_the_guard')
          return null
        job.office = office
      }
      if (key === '}')
        break
    }
    return job
  }

  loadDeities = (lines: string[], start: number) => {
    let line = start + 1
    for (; line < lines.length; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (value !== '{') {
        // To get back to end of section.
        line -= 1
        break
      }
      const [, deity] = this.handleLine(lines[line + 5])
      this.deities[Number(key)] = this.nonStringify(deity)
      // Assumes that deities are 7 line blocks.
      line += 6
    }
    return line
  }

  findEndOfSection = (lines: string[], start: number) => {
    let level = 0
    for (let line = start + 1; line < lines.length; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (value === '{ {')
        level += 2
      else if (value[0] === '{' || key === '{')
        level++
      if (value[value.length - 1] === '}')
        level--
      if (key === '}')
        level--
      if (level < 0)
        return line
    }
    return lines.length
  }

  handleLine = (line: string) => {
    const trimmed = line.trim()
    const split = trimmed.split('=')
    const key = split[0].trim()
    const value = split.length > 1 ? split[1].trim() : ''
    return [key, value]
  }

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

  loadCountry = (lines: string[], entry: Entry<Tag>) => {
    const start = entry.start
    const end = entry.end
    const country: Country = {
      armies: [],
      inventions: [],
      heritage: '',
      militaryExperience: 0,
      name: '' as CountryName,
      tech: 0,
      tradition: CultureType.Dummy,
      armyMaintenance: '',
      navalMaintenance: '',
      traditions: [],
      laws: [],
      availableLaws: [],
      exports: [],
      imports: [],
      ideas: [],
      officeDiscipline: 0,
      officeMorale: 0,
      id: entry.entity.id,
      deities: [],
      religiousUnity: 100,
      religion: '' as string,
      government: '' as GovermentType,
      faction: ''
    }

    if (this.jobs[entry.entity.id]?.officeDiscipline) {
      const character = this.loadCharacter(lines, this.jobs[entry.entity.id].officeDiscipline)
      country.officeDiscipline = Math.floor((character.martial + character.traitMartial) * character.experience / 100.0) / 2
    }
    if (this.jobs[entry.entity.id]?.officeMorale) {
      const character = this.loadCharacter(lines, this.jobs[entry.entity.id].officeMorale)
      country.officeMorale = Math.floor((character.martial + character.traitMartial) * character.experience / 100.0)
    }

    let tech = false
    let firstMilitaryExperience = true
    for (let line = start + 1; line < end; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'name' && !country.name)
        country.name = countries_ir[this.nonStringify(value).toLowerCase()] as CountryName
      if (key === 'military_tradition')
        country.tradition = this.nonStringify(value) as CultureType
      if (key === 'heritage')
        country.heritage = this.nonStringify(value)
      if (key === 'military_tech')
        tech = true
      if (tech && key === 'level') {
        tech = false
        country.tech = Number(value)
      }
      if (key === 'military_experience' && firstMilitaryExperience) {
        firstMilitaryExperience = false
        country.militaryExperience = Number(value)
      }
      if (key === 'units')
        country.armies = this.getNumberList(value)
      if (key === 'idea' && value !== '{')
        country.ideas.push(this.nonStringify(value))
      // Index 9 is Roman special invention, others are military inventions.
      // Probably need to check what other special inventions do.
      if (key === 'active_inventions')
        country.inventions = this.getTruthList(value).filter((_, index) => index === 9 || (75 < index && index < 138))
      if (key === 'economic_policies') {
        const policies = this.getNumberList(value)
        country.armyMaintenance = 'expense_army_' + this.maintenanceToKey(policies[4])
        country.navalMaintenance = 'expense_navy_' + this.maintenanceToKey(policies[5])
      }
      if (key === 'military_tradition_levels')
        country.traditions = this.getNumberList(value).filter((_, index) => index < 3)
      if (key === 'laws')
        country.availableLaws = this.getTruthList(value)
      if (key === 'export')
        country.exports = this.getTruthList(value)
      if (this.laws.includes(key) && country.availableLaws[this.laws.indexOf(key)]) 
        country.laws.push(value)
      if (key === 'deity')
        country.deities.push(this.deities[Number(value)])
      if (key === 'religious_unity')
        country.religiousUnity = 100.0 * Number(value)
      if (key === 'religion')
        country.religion = this.nonStringify(value)
      if (key === 'government') {
        const government = this.nonStringify(value)
        if (government.endsWith('republic'))
          country.government = GovermentType.Republic
        else if (government.endsWith('monarchy'))
          country.government = GovermentType.Monarch
        else
          country.government = GovermentType.Tribe
      }
      if (key === 'party')
        country.faction = this.nonStringify(value)
    }
    return country
  }

  loadArmies = (lines: string[], start: number, end: number, army_ids: number[]) => {
    let armies: Entry<Army>[] = []
    for (let line = start + 1; line < end; line++) {
      const [key, value] = this.handleLine(lines[line])
      const id = Number(key)
      if (isNaN(id) || value !== '{')
        continue
      const start = line
      line = this.findEndOfSection(lines, line)
      if (army_ids.includes(id)) {
        armies.push({
          entity: this.loadArmy(lines, start, line),
          start,
          end: line
        })
      }
    }
    return armies
  }

  loadArmy = (lines: string[], start: number, end: number) => {
    let name = 'Army'
    const army: Army = {
      name: 'Army' as ArmyName,
      cohorts: [],
      flankSize: 5,
      leader: null,
      mode: Mode.Land,
      preferences: {} as UnitPreferences,
      tactic: TacticType.Bottleneck
    }
    const cohorts: number[] = []
    for (let line = start + 1; line < end; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'ordinal')
        name += ' ' + value
      if (key === 'family')
        name += ' ' + this.nonStringify(value)
      if (key === 'name') {
        if (value.startsWith('"RETINUE_ARMY_NAME'))
          name = 'Retinue'
        else if (value.startsWith('"NAVY_NAME')) {
          name = 'Navy'
          army.mode = Mode.Naval
        }
      }
      if (key === 'cohort' || key === 'ship')
        cohorts.push(Number(value))
      if (key === 'leader')
        army.leader = this.loadCharacter(this.lines, Number(value))
      if (key === 'flank_size')
        army.flankSize = Number(value)
      if (key === 'primary')
        army.preferences[UnitPreferenceType.Primary] = dictionaryUnitType[this.nonStringify(value)]
      if (key === 'second')
        army.preferences[UnitPreferenceType.Secondary] = dictionaryUnitType[this.nonStringify(value)]
      if (key === 'flank')
        army.preferences[UnitPreferenceType.Flank] = dictionaryUnitType[this.nonStringify(value)]
      if (key === 'tactic')
        army.tactic = dictionaryTacticType[this.nonStringify(value)]
    }
    army.name = name as ArmyName
    army.cohorts = this.loadCohorts(this.lines, this.bookmarks['subunit_database'].start, this.bookmarks['subunit_database'].end, cohorts)
    return army
  }


  loadCharacter = (lines: string[], character_id: number) => {
    const start = this.bookmarks['character_database'].start
    const end = this.bookmarks['character_database'].end
    const character: Character = {
      martial: 0,
      experience: 0,
      traits: [],
      name: '',
      traitMartial: 0
    }
    for (let line = start + 1; line < end; line++) {
      const [key, value] = this.handleLine(lines[line])
      const id = Number(key)
      if (isNaN(id) || value !== '{')
        continue
      const start = line
      const end = line = this.findEndOfSection(lines, line)
      if (id !== character_id)
        continue
      for (let line = start + 1; line < end; line++) {
        const [key, value] = this.handleLine(lines[line])
        if (key === 'name' && !character.name)
          character.name = this.nonStringify(value)
        if (key === 'family_name' && value.length > 2)
          character.name += ' ' + this.nonStringify(value)
        if (key === 'martial')
          character.martial = Number(value)
        if (key === 'character_experience')
          character.experience = Number(value)
        if (key === 'traits')
          character.traits = this.nonStringify(value).trim().split(' ').map(this.nonStringify)
      }
    }
    character.traitMartial = sum(character.traits.map(key => traits_ir.find(trait => trait.key === key)?.modifiers.find(modifier => modifier.attribute === GeneralAttribute.Martial)?.value ?? 0))
    return character
  }

  loadCohorts = (lines: string[], start: number, end: number, cohort_ids: number[]) => {
    let cohorts: Cohort[] = []
    for (let line = start + 1; line < end; line++) {
      const [key, value] = this.handleLine(lines[line])
      const id = Number(key)
      if (isNaN(id) || value !== '{')
        continue
      const start = line
      line = this.findEndOfSection(lines, line)
      if (cohort_ids.includes(id))
        cohorts.push(this.loadCohort(lines, start, line))
    }
    return cohorts
  }

  loadCohort = (lines: string[], start: number, end: number) => {
    let cohort: Cohort = {
      [UnitAttribute.Experience]: 0,
      [UnitAttribute.Morale]: 0,
      [UnitAttribute.Strength]: 0,
      type: UnitType.None
    }
    for (let line = start + 1; line < end; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'type')
        cohort.type = dictionaryUnitType[this.nonStringify(value)]
      if (key === 'experience')
        cohort[UnitAttribute.Experience] = Number(value)
      if (key === 'morale')
        cohort[UnitAttribute.Morale] = Number(value)
      if (key === 'strength')
        cohort[UnitAttribute.Strength] = Number(value)
    }
    return cohort
  }

  nonStringify = (value: string) => value.substr(1, value.length - 2)

  getNumberList = (value: string) => this.nonStringify(value).trim().split(' ').map(Number)

  getTruthList = (value: string) => this.nonStringify(value).trim().split(' ').map(value => Number(value) > 0)

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
    console.log(this.country)
    if (this.country) {
      this.importing = true
      const countryName = this.country.name
      createCountry(countryName)
      setCountryAttribute(countryName, CountryAttribute.TechLevel, this.country.tech)
      setCountryAttribute(countryName, CountryAttribute.MilitaryExperience, this.country.militaryExperience)
      selectCulture(countryName, this.country.tradition, false)
      const traditionsWithBonus = this.country.traditions.map(value => value === 7 ? 8 : value)
      const traditions = union(...traditionsWithBonus.map((value, index) => (
        mapRange(value, value => 'tradition_path_' + index + '_' + value)
      )))
      enableCountrySelections(countryName, SelectionType.Tradition, traditions)
      const invention_list = sortBy(tech_ir.reduce((prev, curr) => prev.concat(curr.inventions.filter(invention => invention.index)), [] as Invention[]), invention => invention.index)
      const inventions = this.country.inventions.map((value, index) => value && index ? invention_list[index - 1].key : '').filter(value => value)
      const exports = sortBy(trades_ir.filter(entity => entity.index), entity => entity.index)
      const trades = this.country.exports.map((value, index) => value ? exports.find(entity => entity.index === index)?.key ?? '' : '').filter(value => value)
      enableCountrySelections(countryName, SelectionType.Invention, inventions)
      enableCountrySelection(countryName, SelectionType.Heritage, this.country.heritage)
      enableCountrySelections(countryName, SelectionType.Trade, trades)
      enableCountrySelections(countryName, SelectionType.Idea, this.country.ideas)
      enableCountrySelections(countryName, SelectionType.Law, this.country.laws)
      enableCountrySelections(countryName, SelectionType.Deity, this.country.deities)
      enableCountrySelection(countryName, SelectionType.Policy, this.country.armyMaintenance)
      enableCountrySelection(countryName, SelectionType.Policy, this.country.navalMaintenance)
      enableCountrySelection(countryName, SelectionType.Religion, this.country.religion)
      enableCountrySelection(countryName, SelectionType.Faction, this.country.faction)
      setCountryAttribute(countryName, CountryAttribute.OfficeDiscipline, this.country.officeDiscipline)
      setCountryAttribute(countryName, CountryAttribute.OfficeMorale, this.country.officeMorale)
      setCountryAttribute(countryName, CountryAttribute.OmenPower, this.country.religiousUnity - 100)

      this.importArmy()
    }
  }

  importArmy = () => {
    if (this.country) {
      this.importing = true
      const countryName = this.country.name
      if (this.state.army)
        this.importArmyStart(countryName, this.state.army)
      else
        this.state.armies.forEach((_, index) => this.importArmyStart(countryName, String(index)))
    }
  }

  importArmyStart = (countryName: CountryName, index: string) => {
    const { createArmy, deleteArmy, setHasGeneral, setGeneralAttribute, enableGeneralSelections, setFlankSize, setUnitPreference, selectTactic, mode, setMode } = this.props
    const army = this.getArmy(index)
    if (army) {
      const armyName = army?.name
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
  }

  importArmyEnd = (countryName: CountryName, index: string) => {
    const { state, addToReserve, mode, setMode } = this.props
    const army = this.getArmy(index)
    if (army) {
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
  setFlankSize, setUnitPreference, selectTactic, addToReserve, deleteArmy, setMode
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ImportSave)
