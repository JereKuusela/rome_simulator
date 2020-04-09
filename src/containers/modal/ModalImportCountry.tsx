import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ModalType, Mode, TacticType, UnitPreferences, UnitPreferenceType, dictionaryUnitType, dictionaryTacticType, GeneralAttribute, UnitType, UnitAttribute } from 'types'
import { setPhaseDice, invalidate } from 'reducers'
import { Input, Button, Grid, Table } from 'semantic-ui-react'
import BaseModal from './BaseModal'
import Dropdown from 'components/Dropdowns/Dropdown'
import { sortBy, upperFirst, uniq } from 'lodash'
import LabelItem from 'components/Utils/LabelUnit'
import { AppState } from 'state'
import { getDefaultUnits } from 'data'
import AttributeImage from 'components/Utils/AttributeImage'
import { toObj, toArr } from 'utils'

type Entry<T extends Country | Army> = {
  entity: T
  start: number
  end: number
}

type Country = {
  tag: string
}

type Character = {
  name: string
  martial: number
  traits: string[]
}

type Army = {
  name: string
  cohorts: number[]
  mode: Mode
  tactic: TacticType
  preferences: UnitPreferences
  flank_size: number
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
  countries: Entry<Country>[]
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
              onChange={this.selectCountry}
            />
            <Dropdown
              value={army}
              values={armies.map((entry, index) => ({ text: entry.entity.name, value: String(index) }))}
              clearable search
              onChange={this.selectArmy}
            />
            <Button>Import</Button>
          </Grid.Row>
          <Grid.Row>
            {this.renderArmy()}
          </Grid.Row>
        </Grid>
      </BaseModal>
    )
  }

  renderArmy = () => {
    const { army } = this.state
    const { tactics, units } = this.props
    if (!army || !this.combined)
      return null
    const entity = this.combined
    const cohorts = entity.cohorts.map(cohort => cohort.type)
    const types = uniq(cohorts)
    const counts = toObj(types, type => type, type => cohorts.filter(item => item === type).length)
    return (
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              {entity.mode === Mode.Naval ? 'Adminal' : 'General'}
            </Table.Cell>
            <Table.Cell>
              {entity.leader ? entity.leader.name : ''}
            </Table.Cell>
            <Table.Cell>
              {entity.leader ? <><AttributeImage attribute={GeneralAttribute.Martial} />{' ' + entity.leader.martial}</> : ''}
            </Table.Cell>
            <Table.Cell>
              {entity.leader ? entity.leader.traits.join(', ') : ''}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Tactic
            </Table.Cell>
            <Table.Cell>
              <LabelItem item={tactics[entity.tactic]} />
            </Table.Cell>
            <Table.Cell />
            <Table.Cell />
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
              {
                toArr(counts, (value, key) => <><LabelItem item={units[key]} />{' x ' + value}</>)
              }
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  selectCountry = (index: string) => {
    if (index) {
      const tag = this.state.countries[Number(index)]
      const country = this.loadCountry(this.lines, tag.start, tag.end)
      const armies = this.loadArmies(this.lines, this.bookmarks['units_database'].start, this.bookmarks['units_database'].end, country.units)
      this.setState({ country: index, armies, army: '' })
    } else {
      this.setState({ country: index, armies: [], army: '' })
    }
  }

  selectArmy = (index: string) => {
    if (index) {
      const entity = this.state.armies[Number(index)].entity
      this.combined = {
        ...entity,
        leader: entity.leader === null ? null : this.loadCharacter(this.lines, this.bookmarks['character_database'].start, this.bookmarks['character_database'].end, entity.leader),
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
    let countries: Entry<Country>[] = []
    for (let line = 0; line < lines.length; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'tag') {
        const start = line
        line = this.findEndOfSection(lines, line)
        countries.push({
          entity: {
            tag: value.substr(1, value.length - 2)
          },
          start,
          end: line
        })
      }
      if (key === 'subunit_database' || key === 'units_database' || key === 'character_database') {
        const start = line
        line = this.findEndOfSection(lines, line)
        bookmarks[key] = { start, end: line }
      }
    }
    countries = sortBy(countries, entry => entry.entity.tag)
    this.setState({ countries: countries })
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

  loadCountry = (lines: string[], start: number, end: number) => {
    const country = {} as any
    let tech = false
    for (let line = start + 1; line < end; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'military_tradition')
        country.tradition = value
      if (key === 'heritage')
        country.heritage = value
      if (key === 'military_tech')
        tech = true
      if (tech && key === 'level') {
        tech = false
        country.mil_tech = value
      }
      if (key === 'military_experience')
        country.mil_exp = value
      if (key === 'units')
        country.units = value.substr(1, value.length - 2).trim().split(' ').map(Number)
      if (key === 'active_inventions')
        country.inventions = value
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
    const army: Army = {
      name: 'Army',
      cohorts: [],
      flank_size: 5,
      leader: null,
      mode: Mode.Land,
      preferences: {} as UnitPreferences,
      tactic: TacticType.Bottleneck
    }
    for (let line = start + 1; line < end; line++) {
      const [key, value] = this.handleLine(lines[line])
      if (key === 'ordinal')
        army.name += ' ' + value
      if (key === 'family')
        army.name += ' ' + this.nonStringify(value)
      if (key === 'name') {
        if (value.startsWith('"RETINUE_ARMY_NAME'))
          army.name = 'Retinue'
        else if (value.startsWith('"NAVY_NAME'))
          army.name = 'Navy'
      }
      if (key === 'cohort' || key === 'ship')
        army.cohorts.push(Number(value))
      if (key === 'leader')
        army.leader = Number(value)
      if (key === 'flank_size')
        army.flank_size = Number(value)
      if (key === 'primary')
        army.preferences[UnitPreferenceType.Primary] = dictionaryUnitType[this.nonStringify(value)]
      if (key === 'second')
        army.preferences[UnitPreferenceType.Secondary] = dictionaryUnitType[this.nonStringify(value)]
      if (key === 'flank')
        army.preferences[UnitPreferenceType.Flank] = dictionaryUnitType[this.nonStringify(value)]
      if (key === 'tactic')
        army.tactic = dictionaryTacticType[this.nonStringify(value)]
    }
    return army
  }


  loadCharacter = (lines: string[], start: number, end: number, character_id: number) => {
    const character: Character = {
      martial: 0,
      traits: [],
      name: ''
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
        if (key === 'traits')
          character.traits = this.nonStringify(value).trim().split(' ').map(this.nonStringify).map(upperFirst)
      }
    }
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

  importArmy = () => {

  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics,
  units: getDefaultUnits()
})

const actions = { setPhaseDice, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends S, D { }

export default connect(mapStateToProps, actions)(ModalImportCountry)
