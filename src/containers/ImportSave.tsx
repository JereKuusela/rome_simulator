import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Mode, UnitPreferenceType, GeneralAttribute, UnitAttribute, CountryName, CountryAttribute, SelectionType, Invention, ArmyName, CohortData, Save, SaveArmy, SaveCountry } from 'types'
import {
  enableGeneralSelections, createCountry, setCountryAttribute, selectCulture, enableCountrySelections, enableCountrySelection, createArmy, setHasGeneral, setGeneralAttribute,
  setFlankSize, setUnitPreference, selectTactic, addToReserve, deleteArmy, setMode, enableGeneralSelection
} from 'reducers'
import { Input, Button, Grid, Table, Header } from 'semantic-ui-react'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { sortBy, uniq, sum, union } from 'lodash'
import LabelItem from 'components/Utils/LabelUnit'
import { AppState, getUnitDefinitions, getMode } from 'state'
import { getDefaultUnits, countriesIR, traditionsIR, heritagesIR, policiesIR, lawsIR, factionsIR, religionsIR, deitiesIR, modifiersIR, traitsIR, techIR, tradesIR, ideasIR, abilitiesIR } from 'data'
import AttributeImage from 'components/Utils/AttributeImage'
import { toObj, toArr, mapRange, map, keys, excludeMissing } from 'utils'
import { calculateValueWithoutLoss } from 'definition_values'
import { parseFile, binaryToPlain } from 'managers/importer'
import JSZip from 'jszip'
import { loadCountry, loadArmy } from 'managers/saves'

type IState = {
  country: SaveCountry | null
  armies: SaveArmy[]
  army: SaveArmy | null
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

  getTagName = (tag: string) => countriesIR[tag.toLowerCase()] ? countriesIR[tag.toLowerCase()] + ' (' + tag + ')' : tag

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
            <Header style={{ display: 'inline' }} >Select a save game to import</Header>
            <Input style={{ display: 'inline' }} type='file' onChange={event => this.loadContent(event.target.files![0])} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns='4'>
          <Grid.Column>
            <SimpleDropdown
              value={String(country?.id ?? '')}
              values={countries}
              clearable search
              onChange={countries.length ? this.selectCountry : undefined}
              placeholder='Select country'
            />
          </Grid.Column>
          <Grid.Column>
            <SimpleDropdown
              value={String(army?.id ?? '')}
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
            {traditionsIR[country.tradition]?.name}
          </Table.Cell>
          <Table.Cell>
            Heritage
          </Table.Cell>
          <Table.Cell>
            {heritagesIR[country.heritage]?.name}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Army
          </Table.Cell>
          <Table.Cell>
            {policiesIR.find(policy => policy.find(option => option.key === country.armyMaintenance))?.find(option => option.key === country.armyMaintenance)?.name}
          </Table.Cell>
          <Table.Cell>
            Navy
          </Table.Cell>
          <Table.Cell>
            {policiesIR.find(policy => policy.find(option => option.key === country.navalMaintenance))?.find(option => option.key === country.navalMaintenance)?.name}
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
            {country.surplus.map(key => tradesIR[key]?.name).filter(value => value).join(', ')}
          </Table.Cell>
          <Table.Cell>
            Ideas
          </Table.Cell>
          <Table.Cell>
            {country.ideas.map(key => ideasIR[key]?.name).filter(value => value).join(', ')}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Laws
          </Table.Cell>
          <Table.Cell>
            {country.laws.map(key => lawsIR[key]?.name).filter(value => value).join(', ')}
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
            {factionsIR[country.faction]?.name}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Religion
          </Table.Cell>
          <Table.Cell>
            {religionsIR[country.religion]?.name} ({country.religiousUnity.toPrecision(3)}%)
          </Table.Cell>
          <Table.Cell>
            Deities
          </Table.Cell>
          <Table.Cell>
            {country.deities.map(key => deitiesIR[key] ? deitiesIR[key].name + (country.omen.substr(4) === key.substr(5) ? ' (with omen)' : '') : null).filter(value => value).join(', ')}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Modifiers
          </Table.Cell>
          <Table.Cell colSpan='3'>
            {country.modifiers.map(key => modifiersIR[key]?.name).filter(value => value).join(', ')}
          </Table.Cell>
        </Table.Row>
      </>
    )
  }

  renderArmy = (army: SaveArmy) => {
    const { tactics, units } = this.props
    const cohorts = army.cohorts.map(cohort => cohort.type)
    const types = uniq(cohorts)
    const counts = toObj(types, type => type, type => cohorts.filter(item => item === type).length)
    const ability = abilitiesIR.find(abilities => abilities.find(ability => ability.key === army.ability))?.find((ability => ability.key === army.ability))?.name
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
            {army.leader ? army.leader.traits.map(key => traitsIR[key]?.name).join(', ') : ''}
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
    const country = id ? loadCountry(this.state.file, Number(id)) : null
    const armies = country && country.armies ? excludeMissing(country.armies.map(id => loadArmy(this.state.file, id))) : []
    if (country)
      this.setState({ country, armies })
  }

  selectArmy = (id: string) => {
    this.setState({ army: id ? loadArmy(this.state.file, Number(id)) ?? null : null })
  }

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
      return keys(data).map(key => ({ text: this.getTagName(data[Number(key)].tag), value: key }))
    }
    return []
  }

  getArmyList = () => this.state.armies.map(army => ({ text: army.name, value: String(army.id) }))


 
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
    const invention_list = sortBy(techIR.reduce((prev, curr) => prev.concat(curr.inventions.filter(invention => invention.index)), [] as Invention[]), invention => invention.index)
    const inventions = country.inventions.map((value, index) => value && index ? invention_list[index - 1].key : '').filter(value => value)
    enableCountrySelections(countryName, SelectionType.Invention, inventions)
    enableCountrySelection(countryName, SelectionType.Heritage, country.heritage)
    enableCountrySelections(countryName, SelectionType.Trade, country.surplus)
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

  importArmyStart = (countryName: CountryName, army: SaveArmy) => {
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

  importArmyEnd = (countryName: CountryName, army: SaveArmy) => {
    const { state, addToReserve, mode, setMode } = this.props
    const armyName = army.name
    const units = getUnitDefinitions(state, countryName, armyName, army.mode)
    const experiences = map(units, unit => calculateValueWithoutLoss(unit, UnitAttribute.Experience))
    const maxStrengths = map(units, unit => calculateValueWithoutLoss(unit, UnitAttribute.Strength))
    const maxMorales = map(units, unit => calculateValueWithoutLoss(unit, UnitAttribute.Morale))
    const cohorts: CohortData[] = army.cohorts.map(cohort => ({
      type: cohort.type,
      baseValues: {
        [UnitAttribute.Experience]: {
          'Custom': cohort[UnitAttribute.Experience] - experiences[cohort.type]
        }
      } as any,
      lossValues: {
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
