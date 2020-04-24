import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ModalType, Mode, TacticType, UnitPreferences, UnitPreferenceType, dictionaryUnitType, dictionaryTacticType, GeneralAttribute, UnitType, UnitAttribute, CultureType, CountryName, CountryAttribute, SelectionType, Invention, ArmyName } from 'types'
import { createCountry, setCountryAttribute, selectCulture, enableCountrySelections, enableCountrySelection, createArmy, setHasGeneral, setGeneralAttribute } from 'reducers'
import { Input, Button, Grid, Table } from 'semantic-ui-react'
import BaseModal from './BaseModal'
import Dropdown from 'components/Dropdowns/Dropdown'
import { sortBy, uniq, sum, union } from 'lodash'
import LabelItem from 'components/Utils/LabelUnit'
import { AppState } from 'state'
import { getDefaultUnits } from 'data'
import AttributeImage from 'components/Utils/AttributeImage'
import { toObj, toArr, mapRange } from 'utils'
import { heritages_ir, traits_ir, traditions_ir, tech_ir, trades_ir, laws_ir, policies_ir } from 'managers/modifiers'

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
  character: Character
  job: string
}

type Country = {
  id: number
  name: CountryName
  tradition: CultureType
  traditions: number[]
  heritage: string
  tech: number
  armies: number[]
  inventions: boolean[]
  militaryExperience: number
  armyMaintenance: string
  navalMaintenance: string
  available_laws: boolean[]
  laws: string[]
  ideas: string[]
  exports: boolean[]
  imports: boolean[]
  officeDiscipline: number
  officeMorale: number
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
  cohorts: number[]
  mode: Mode
  tactic: TacticType
  preferences: UnitPreferences
  flankSize: number
  leader: number | null

}

type Cohort = {
  type: UnitType
  [UnitAttribute.Morale]: number
  [UnitAttribute.Strength]: number
  [UnitAttribute.Experience]: number
}

type Combined = Omit<Army, 'leader' | 'cohorts'> & {
  leader: Character | null
  cohorts: Cohort[]
}

type IState = {
  countries: Entry<Tag>[]
  country: string
  armies: Entry<Army>[]
  army: string
}

type Bookmarks = { [key: string]: { start: number, end: number } }

class ModalImportCountry extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { countries: [], country: '', army: '', armies: [] }
  }

  lines: string[] = []
  bookmarks: Bookmarks = {}
  combined: Combined | null = null
  country: Country | null = null


  render() {
    const { countries, country, army, armies } = this.state
    return (
      <BaseModal type={ModalType.ImportCountry}>
        <Grid>
          <Grid.Row>
            <Input type='file' onChange={event => this.loadContent(event.target.files![0])} />
          </Grid.Row>
          <Grid.Row>
            <Dropdown
              value={country}
              values={countries.map((entry, index) => ({ text: entry.entity.tag, value: String(index) }))}
              clearable search
              onChange={countries.length ? this.selectCountry : undefined}
              placeholder='Select country'
            />
            <Dropdown
              value={army}
              values={armies.map((entry, index) => ({ text: entry.entity.name, value: String(index) }))}
              clearable search
              onChange={armies.length ? this.selectArmy : undefined}
              placeholder='Select army'
            />
            <Button onClick={this.importCountry} disabled={!this.country}>Import</Button>
          </Grid.Row>
          <Grid.Row>
            {this.renderArmy()}
          </Grid.Row>
        </Grid>
      </BaseModal>
    )
  }

  renderArmy = () => {
    return (
      <Table>
        <Table.Body>
          {this.renderCountry()}
          {this.renderCombined()}
        </Table.Body>
      </Table>
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
            {traditions_ir[entity.tradition].name}
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
            {entity.laws.map(key => laws_ir.find(law => key === law.key)?.name).join(', ')}
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
            Religion
          </Table.Cell>
          <Table.Cell>
            Not implemented
          </Table.Cell>
          <Table.Cell>
            Gods
          </Table.Cell>
          <Table.Cell>
            Not implemented
          </Table.Cell>
        </Table.Row>
      </>
    )
  }

  renderCombined = () => {
    const { tactics, units } = this.props
    const entity = this.combined
    if (!entity)
      return null
    const cohorts = entity.cohorts.map(cohort => cohort.type)
    const types = uniq(cohorts)
    const counts = toObj(types, type => type, type => cohorts.filter(item => item === type).length)
    return (
      <>
        <Table.Row><Table.Cell /><Table.Cell /><Table.Cell /><Table.Cell /></Table.Row>
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
            {toArr(counts, (value, key) => <><LabelItem key={key} item={units[key]} />{' x ' + value}</>)}
          </Table.Cell>
        </Table.Row>
      </>
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
      this.combined = null
      this.setState({ country: index, armies: [], army: '' })
    }
  }

  selectArmy = (index: string) => {
    if (index) {
      const entity = this.state.armies[Number(index)].entity
      this.combined = {
        ...entity,
        leader: entity.leader === null ? null : this.loadCharacter(this.lines, entity.leader),
        cohorts: this.loadCohorts(this.lines, this.bookmarks['subunit_database'].start, this.bookmarks['subunit_database'].end, entity.cohorts)
      }
      this.setState({ army: index })
    } else {
      this.combined = null
      this.setState({ army: index })
    }
  }

  loadContent = (file: File) => {
    const blob = file as any
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
      if (key === 'subunit_database' || key === 'units_database' || key === 'character_database' || key === 'provinces' || key === 'jobs') {
        const start = line
        line = this.findEndOfSection(lines, line)
        bookmarks[key] = { start, end: line }
      }
      previousKey = key
    }
    countries = sortBy(countries, entry => entry.entity.tag)
    this.setState({ countries: countries })
  }

  loadJobs = (country: Country, lines: string[]) => {
    const start = this.bookmarks['jobs'].start
    const end = this.bookmarks['jobs'].end
    for (let line = start + 2; line < end; line++) {
      const [, value] = this.handleLine(lines[line])
      if (Number(value) === country.id) {
        const job = this.loadJob(lines, line)
        if (job.job === 'office_tribune_of_the_soldiers')
          country.officeDiscipline = Math.floor((job.character.martial + job.character.traitMartial) * job.character.experience / 100.0) / 2
        if (job.job === 'office_master_of_the_guard')
          country.officeMorale = Math.floor((job.character.martial + job.character.traitMartial) * job.character.experience / 100.0)
      }
      // Assumes that jobs are 6 line blocks.
      line += 5
    }
  }

  loadJob = (lines: string[], start: number) => {
    const job: Job = {
      character: null as any as Character,
      job: ''
    }
    for (let line = start + 1; line < lines.length; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'character')
        job.character = this.loadCharacter(lines, Number(value))

      if (key === 'technology' || key === 'office')
        job.job = this.nonStringify(value)
      if (key === '}')
        break
    }
    return job
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
      available_laws: [],
      exports: [],
      imports: [],
      ideas: [],
      officeDiscipline: 0,
      officeMorale: 0,
      id: entry.entity.id
    }
    let tech = false
    for (let line = start + 1; line < end; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'name' && !country.name)
        country.name = this.nonStringify(value) as CountryName
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
      if (key === 'military_experience')
        country.militaryExperience = Number(value)
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
        country.available_laws = this.getTruthList(value)
      if (key === 'export')
        country.exports = this.getTruthList(value)
      if (key === 'monarchy_military_reforms' && country.available_laws[1])
        country.laws.push(value)
      if (key === 'monarchy_economic_law' && country.available_laws[3])
        country.laws.push(value)
      if (key === 'republic_military_recruitment_laws' && country.available_laws[10])
        country.laws.push(value)
      if (key === 'republic_military_recruitment_laws_rom' && country.available_laws[18])
        country.laws.push(value)
      if (key === 'tribal_super_decentralized_laws' && country.available_laws[34])
        country.laws.push(value)
    }
    this.loadJobs(country, lines)
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
    for (let line = start + 1; line < end; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'ordinal')
        name += ' ' + value
      if (key === 'family')
        name += ' ' + this.nonStringify(value)
      if (key === 'name') {
        if (value.startsWith('"RETINUE_ARMY_NAME'))
          name = 'Retinue'
        else if (value.startsWith('"NAVY_NAME'))
          name = 'Navy'
      }
      if (key === 'cohort' || key === 'ship')
        army.cohorts.push(Number(value))
      if (key === 'leader')
        army.leader = Number(value)
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
        if (key === 'name')
          character.name = this.nonStringify(value)
        if (key === 'family_name')
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
    const { createCountry, setCountryAttribute, selectCulture, enableCountrySelections, enableCountrySelection, createArmy, setHasGeneral, setGeneralAttribute	 } = this.props
    console.log(this.country)
    const name = this.country?.name
    if (this.country && name) {
      createCountry(name)
      setCountryAttribute(name, CountryAttribute.TechLevel, this.country.tech)
      setCountryAttribute(name, CountryAttribute.MilitaryExperience, this.country.militaryExperience)
      selectCulture(name, this.country.tradition, false)
      const traditionsWithBonus = this.country.traditions.map(value => value === 7 ? 8 : value)
      const traditions = union(...traditionsWithBonus.map((value, index) => (
        mapRange(value, value => 'tradition_path_' + index + '_' + value)
      )))
      enableCountrySelections(name, SelectionType.Tradition, traditions)
      const invention_list = sortBy(tech_ir.reduce((prev, curr) => prev.concat(curr.inventions.filter(invention => invention.index)), [] as Invention[]), invention => invention.index)
      const inventions = this.country.inventions.map((value, index) => value && index ? invention_list[index - 1].key : '').filter(value => value)
      const exports = sortBy(trades_ir.filter(entity => entity.index), entity => entity.index)
      const trades = this.country.exports.map((value, index) => value ? exports.find(entity => entity.index === index)?.key ?? '' : '').filter(value => value)
      enableCountrySelections(name, SelectionType.Invention, inventions)
      enableCountrySelection(name, SelectionType.Heritage, this.country.heritage)
      enableCountrySelections(name, SelectionType.Trade, trades)
      enableCountrySelections(name, SelectionType.Idea, this.country.ideas)
      enableCountrySelections(name, SelectionType.Law, this.country.laws)
      enableCountrySelection(name, SelectionType.Policy, this.country.armyMaintenance)
      enableCountrySelection(name, SelectionType.Policy, this.country.navalMaintenance)
      setCountryAttribute(name, CountryAttribute.OfficeDiscipline, this.country.officeDiscipline)
      setCountryAttribute(name, CountryAttribute.OfficeMorale, this.country.officeMorale)
    }
    if (this.combined && name) {
      createArmy(name, this.combined.mode, this.combined.name)
      if (this.combined.leader) {
        setGeneralAttribute(name, this.combined.name, GeneralAttribute.Martial, this.combined.leader.martial)
      } else {
        setHasGeneral(name, this.combined.name, false)
      }
    }
  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics,
  countries: state.countries,
  units: getDefaultUnits()
})

const actions = { createCountry, setCountryAttribute, selectCulture, enableCountrySelections, enableCountrySelection, createArmy, setHasGeneral, setGeneralAttribute }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalImportCountry)
