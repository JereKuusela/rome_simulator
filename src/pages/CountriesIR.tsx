import React, { Component, useEffect, useState } from 'react'
import { Container, Grid, Table, List, Input, Checkbox, Button, Tab } from 'semantic-ui-react'
import { connect, useDispatch } from 'react-redux'
import type { AppState } from 'reducers'
import { mapRange, values, keys, toArr, ObjSet } from '../utils'

import { addSignWithZero } from 'formatters'
import {
  DataEntry,
  Modifier,
  CountryAttribute,
  CharacterAttribute,
  CombatPhase,
  GeneralValueType,
  filterAttributes,
  CountryName,
  SelectionType,
  ArmyName,
  Country,
  GeneralDefinition
} from 'types'
import {
  clearCountryAttributes,
  setCountryAttribute,
  enableCountrySelections,
  enableCountrySelection,
  clearCountrySelections,
  clearCountrySelection,
  setGeneralAttribute,
  selectGovernment,
  setHasGeneral,
  clearGeneralAttributes,
  clearGeneralSelection,
  enableGeneralSelection,
  clearGeneralSelections,
  toggleFilterNonCombat
} from 'reducers'

import AccordionToggle from 'containers/AccordionToggle'
import CountryManager from 'containers/CountryManager'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import StyledNumber from 'components/Utils/StyledNumber'
import TableAttributes from 'components/TableAttributes'
import CountryValueInput from 'containers/CountryValueInput'
import ListModifier from 'components/Utils/ListModifier'
import DropdownListDefinition from 'components/Dropdowns/DropdownListDefinition'
import {
  traditionsIR,
  traitsIR,
  tradesIR,
  deitiesIR,
  lawsIR,
  ideasIR,
  effectsIR,
  heritagesIR,
  religionsIR,
  factionsIR,
  abilitiesIR,
  policiesIR,
  inventionsIR,
  distinctionsIR
} from 'data'
import { TableModifierList } from 'components/TableModifierList'
import { groupBy, maxBy, noop } from 'lodash'
import { Tech } from 'types/generated'
import { getSelections } from 'managers/modifiers'
import {
  getCombatSettings,
  getCountry,
  getCountryDefinition,
  getGeneralData,
  getGeneralDefinition,
  getSelectedArmy,
  getSelectedCountry
} from 'selectors'

const PERCENT_PADDING = '\u00a0\u00a0\u00a0\u00a0'

const CELL_PADDING = '.78571429em .78571429em'

type DataEntriesByParentProps = {
  selections: ObjSet
  type: SelectionType
  entries: Record<string, DataEntry[]>
  onClick: (enabled: boolean) => (type: SelectionType, key: string) => void
  disabled: boolean
  padding?: string
}

type RenderCellProps = {
  type: SelectionType
  entryKey: string
  name: string | null
  enabled: boolean
  modifiers: Modifier[]
  onClick: (enabled: boolean) => (type: SelectionType, key: string) => void
  padding?: string
  disabled?: boolean
  width?: number
}

const RenderCell = ({
  type,
  entryKey,
  name,
  enabled,
  modifiers,
  onClick,
  padding,
  disabled,
  width
}: RenderCellProps) => (
  <Table.Cell
    disabled={disabled}
    positive={enabled}
    selectable
    colSpan={width || 1}
    onClick={() => onClick(enabled)(type, entryKey)}
    style={{ padding: CELL_PADDING }}
  >
    <ListModifier name={name} modifiers={modifiers} padding={padding} />
  </Table.Cell>
)

const DataEntriesByParent = ({ selections, type, entries, onClick, disabled, padding }: DataEntriesByParentProps) => {
  const columns = maxBy(Object.values(values), item => item.length)?.length ?? 0
  return (
    <Table celled unstackable fixed>
      <Table.Body>
        {Object.values(entries).map((items, index) => (
          <Table.Row key={index}>
            {items.map(item => {
              const key = item.key
              return (
                <RenderCell
                  key={key}
                  type={type}
                  entryKey={key}
                  name={item.name}
                  enabled={selections?.[key]}
                  modifiers={item.modifiers}
                  onClick={onClick}
                  padding={padding}
                  disabled={disabled}
                />
              )
            })}
            {mapRange(columns - items.length, value => (
              <Table.Cell key={value} />
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

type DataEntryDropdownProps = {
  selections: ObjSet
  type: SelectionType
  entries: DataEntry[]
  onClick: (enabled: boolean) => (type: SelectionType, key: string) => void
}

const DataEntryDropdown = ({ selections, entries, onClick, type }: DataEntryDropdownProps) => {
  const value = selections && keys(selections).length ? keys(selections)[0] : ''
  return (
    <DropdownListDefinition value={value} values={entries} onSelect={key => onClick(false)(type, key)} type={type} />
  )
}

class CountriesIR extends Component<IProps> {
  render() {
    const {
      settings,
      generalDefinition,
      generalData,
      filterNonCombat,
      countryDefinition,
      country,
      selectedArmy
    } = this.props
    return (
      <Container>
        <CountryManager>
          <Button negative onClick={this.clearAll}>
            Clear selections
          </Button>
        </CountryManager>
        <Grid>
          <Grid.Row columns='3'>
            <Grid.Column>
              <Checkbox
                checked={filterNonCombat}
                label='Filter non-combat modifiers'
                onChange={this.props.toggleFilterNonCombat}
              />
            </Grid.Column>
          </Grid.Row>
          <RenderGeneralSection
            country={country}
            armyName={selectedArmy}
            general={generalDefinition}
            filterNonCombat={filterNonCombat}
          />
          <RenderTraditionSection country={country} filterNonCombat={filterNonCombat} />
          <RenderTradeSection country={country} filterNonCombat={filterNonCombat} />
          <RenderTechSection country={country} filterNonCombat={filterNonCombat} />
          <RenderReligionSection country={country} filterNonCombat={filterNonCombat} />
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Heritage, Government, Economy & Ideas' identifier='countriesGovernment'>
                <Grid padded>
                  <Grid.Row columns='3'>
                    <Grid.Column>
                      <RenderHeritages country={country} filterNonCombat={filterNonCombat} />
                    </Grid.Column>
                    <Grid.Column>
                      <RenderFactions country={country} filterNonCombat={filterNonCombat} />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
                {this.renderLaws(filterNonCombat)}
                {this.renderPolicies(filterNonCombat)}
                {this.renderIdeas(filterNonCombat)}
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Modifiers & Events' identifier='countries_modifiers'>
                <TableModifierList
                  selections={this.props.country.selections[SelectionType.Effect]}
                  columns={4}
                  usePercentPadding
                  type={SelectionType.Effect}
                  onClick={this.onCountryItemClick}
                  items={effectsIR.byIndex(filterNonCombat)}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Attributes' identifier='countries_attributes'>
                <TableAttributes
                  attributes={filterAttributes(values(CountryAttribute), settings)}
                  customValueKey='Custom'
                  definition={countryDefinition.modifiers}
                  onChange={this.setCountryValue}
                />
                <TableAttributes
                  attributes={filterAttributes(
                    (values(CharacterAttribute) as GeneralValueType[]).concat(values(CombatPhase)),
                    settings
                  )}
                  customValueKey='Custom'
                  definition={generalData}
                  onChange={this.setGeneralValue}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }

  renderDropdown = (type: SelectionType, items: DataEntry[]) => {
    const selections = this.props.country.selections[type] ?? this.props.generalData.selections[type]
    const value = selections && keys(selections).length ? keys(selections)[0] : ''
    return (
      <DropdownListDefinition
        settings={this.props.settings}
        value={value}
        values={items}
        onSelect={key => this.enableCountrySelection(type, key)}
        type={type}
      />
    )
  }

  renderLaws = (filter: boolean) => this.renderByParentForCountries(SelectionType.Law, lawsIR.byParent(filter))

  renderIdeas = (filter: boolean) => this.renderByParentForCountries(SelectionType.Idea, ideasIR.byParent(filter))

  renderPolicies = (filter: boolean) =>
    this.renderByParentForCountries(SelectionType.Policy, policiesIR.byParent(filter))

  renderByParentForCountries = (type: SelectionType, values: Record<string, DataEntry[]>) =>
    this.renderByParent(type, values, this.onCountryItemClick, false, PERCENT_PADDING)

  renderByParent = (
    type: SelectionType,
    values: Record<string, DataEntry[]>,
    onClick: (enabled: boolean) => (type: SelectionType, key: string) => void,
    disabled: boolean,
    padding?: string
  ) => {
    const selections = this.props.country.selections[type] ?? this.props.generalData.selections[type]
    const columns = maxBy(Object.values(values), item => item.length)?.length ?? 0
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {Object.values(values).map((option, index) => (
            <Table.Row key={index}>
              {option.map(item => {
                const key = item.key
                return this.renderCell2(
                  type,
                  key,
                  item.name,
                  selections && selections[key],
                  item.modifiers,
                  onClick,
                  padding,
                  disabled
                )
              })}
              {mapRange(columns - option.length, value => (
                <Table.Cell key={value} />
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  clearGeneralSelection = (type: SelectionType, key: string) => {
    const { clearGeneralSelection } = this.props
    this.execArmy(clearGeneralSelection, type, key)
  }

  clearCountrySelection = (type: SelectionType, key: string) => {
    const { clearCountrySelection } = this.props
    this.execCountry(clearCountrySelection, type, key)
  }

  enableCountrySelection = (type: SelectionType, key: string) => {
    const { enableCountrySelection, clearCountrySelections } = this.props
    if (type === SelectionType.Heritage || type === SelectionType.Religion || type === SelectionType.Faction)
      this.execCountry(clearCountrySelections, type)
    if (type === SelectionType.Policy) {
      const keys = policiesIR.siblingKeys(key)
      if (keys) this.execCountry(clearCountrySelections, type, keys)
    }
    this.execCountry(enableCountrySelection, type, key)
  }

  onCountryItemClick = (enabled: boolean) => (enabled ? this.clearCountrySelection : this.enableCountrySelection)

  renderCell2 = (
    type: SelectionType,
    key: string,
    name: string | null,
    enabled: boolean,
    modifiers: Modifier[],
    onClick: (enabled: boolean) => (type: SelectionType, key: string) => void,
    padding?: string,
    disabled?: boolean,
    width?: number
  ) => (
    <Table.Cell
      disabled={disabled}
      key={key}
      positive={enabled}
      selectable
      colSpan={width || 1}
      onClick={() => onClick(enabled)(type, key)}
      style={{ padding: CELL_PADDING }}
    >
      <ListModifier name={name} modifiers={modifiers} padding={padding} />
    </Table.Cell>
  )

  renderCell = (
    key: string,
    name: string | null,
    enabled: boolean,
    modifiers: Modifier[],
    enable?: () => void,
    clear?: () => void,
    padding?: string,
    disabled?: boolean,
    width?: number
  ) => (
    <Table.Cell
      disabled={disabled}
      key={key}
      positive={enabled}
      selectable
      colSpan={width || 1}
      onClick={enabled ? (clear ? clear : noop) : enable ? enable : noop}
      style={{ padding: CELL_PADDING }}
    >
      <ListModifier name={name} modifiers={modifiers} padding={padding} />
    </Table.Cell>
  )

  /** Executes a given function with currently selected country. */
  execCountry = <T1, T2>(func: (country: CountryName, value: T1, ...rest: T2[]) => void, value: T1, ...rest: T2[]) =>
    func(this.props.country.name, value, ...rest)
  execArmy = <T1, T2>(
    func: (country: CountryName, army: ArmyName, value: T1, ...rest: T2[]) => void,
    value: T1,
    ...rest: T2[]
  ) => func(this.props.country.name, this.props.selectedArmy, value, ...rest)

  /**
   * Clears all selections.
   */
  clearAll = () => {
    this.execCountry(this.props.clearCountrySelections, undefined)
    this.execCountry(this.props.clearCountryAttributes, undefined)
    this.execArmy(this.props.clearGeneralSelections, undefined)
    this.execArmy(this.props.clearGeneralAttributes, undefined)
    this.execArmy(this.props.setHasGeneral, true)
  }

  setCountryValue = (_: string, attribute: CountryAttribute, value: number) =>
    this.execCountry(this.props.setCountryAttribute, attribute, value)

  setGeneralValue = (_: string, attribute: GeneralValueType, value: number) =>
    this.execArmy(this.props.setGeneralAttribute, attribute, value)
}

const mapStateToProps = (state: AppState) => {
  const selectedArmy = getSelectedArmy(state)
  const selectedCountry = getSelectedCountry(state)
  const key = { countryName: selectedCountry, armyName: selectedArmy }
  return {
    countryDefinition: getCountryDefinition(state, selectedCountry),
    country: getCountry(state, selectedCountry),
    filterNonCombat: state.ui.filterNonCombat,
    selectedArmy,
    generalDefinition: getGeneralDefinition(state, key),
    generalData: getGeneralData(state, key),
    settings: getCombatSettings(state)
  }
}

const actions = {
  clearGeneralSelections,
  setGeneralAttribute,
  setCountryAttribute,
  clearGeneralSelection,
  clearCountryAttributes,
  clearGeneralAttributes,
  selectGovernment,
  setHasGeneral,
  enableCountrySelection,
  clearCountrySelection,
  enableCountrySelections,
  clearCountrySelections,
  toggleFilterNonCombat
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = S & D

const getTechAttribute = (key: string) => {
  if (key.toLowerCase().includes('relig')) return CountryAttribute.ReligiousTech
  if (key.toLowerCase().includes('orato')) return CountryAttribute.OratoryTech
  if (key.toLowerCase().includes('civic')) return CountryAttribute.CivicTech
  return CountryAttribute.MartialTech
}

const useCountrySelection = (countryName: CountryName) => {
  const dispatch = useDispatch()

  const clear = (type: SelectionType, key: string) => dispatch(clearCountrySelection(countryName, type, key))
  const enable = (type: SelectionType, key: string) => {
    if (type === SelectionType.Heritage || type === SelectionType.Religion || type === SelectionType.Faction)
      dispatch(clearCountrySelections(countryName, type))
    if (type === SelectionType.Policy) {
      const keys = policiesIR.siblingKeys(key)
      if (keys) dispatch(clearCountrySelections(countryName, type, keys))
    }
    dispatch(enableCountrySelection(countryName, type, key))
  }

  return (enabled: boolean) => (enabled ? clear : enable)
}

const useGeneralSelection = (countryName: CountryName, armyName: ArmyName) => {
  const dispatch = useDispatch()

  const clear = (type: SelectionType, key: string) => dispatch(clearGeneralSelection(countryName, armyName, type, key))
  const enable = (type: SelectionType, key: string) => {
    if (type === SelectionType.Ability) {
      const keys = abilitiesIR.siblingKeys(key)
      if (keys) dispatch(clearGeneralSelections(countryName, armyName, type, keys))
    }
    dispatch(enableGeneralSelection(countryName, armyName, type, key))
  }

  return (enabled: boolean) => (enabled ? clear : enable)
}

type CountruSelectionGroupProps = {
  country: Country
  parent: string
  filterNonCombat: boolean
}

type RenderInventionsProps = {
  country: Country
  tech: string
  attribute: CountryAttribute
  filterNonCombat: boolean
}

const RenderInventions = ({ country, tech, attribute, filterNonCombat }: RenderInventionsProps) => {
  const handleOnClick = useCountrySelection(country.name)
  return (
    <>
      <div style={{ padding: '0.785714em' }}>
        {attribute}: <CountryValueInput attribute={attribute} country={country.name} showEffect />
      </div>

      <TableModifierList
        selections={country.selections[SelectionType.Invention]}
        columns={4}
        usePercentPadding
        type={SelectionType.Invention}
        onClick={handleOnClick}
        items={inventionsIR.byParent(filterNonCombat)[tech]}
      />
    </>
  )
}

type CountrySelectionProps = { country: Country; filterNonCombat: boolean }

const RenderTechSection = ({ country, filterNonCombat }: CountrySelectionProps) => {
  const panes = toArr(inventionsIR.byParent(), (_, key: string) => ({
    menuItem: key,
    render: () => (
      <RenderInventions
        country={country}
        tech={key}
        attribute={getTechAttribute(key)}
        filterNonCombat={filterNonCombat}
      />
    )
  })).sort((a, b) =>
    a.menuItem === Tech.Martial ? -1 : b.menuItem === Tech.Martial ? 1 : a.menuItem.localeCompare(b.menuItem)
  )

  return (
    <Grid.Row columns='1'>
      <Grid.Column>
        <AccordionToggle title='Technology & Inventions' identifier='countriesInvention'>
          <Tab panes={panes} />
        </AccordionToggle>
      </Grid.Column>
    </Grid.Row>
  )
}

type GeneralSelectionProps = {
  country: Country
  armyName: ArmyName
  general: GeneralDefinition
  filterNonCombat: boolean
}

type GeneralSelectionGroupProps = GeneralSelectionProps & {
  parent: string
}

const RenderTraitGroup = ({ country, armyName, general, parent, filterNonCombat }: GeneralSelectionGroupProps) => {
  const handleOnClick = useGeneralSelection(country.name, armyName)
  return (
    <TableModifierList
      selections={general.selections[SelectionType.Trait]}
      columns={4}
      usePercentPadding
      type={SelectionType.Trait}
      onClick={handleOnClick}
      items={traitsIR.byParent(filterNonCombat)[parent]}
    />
  )
}

type RenderGeneralProps = {
  country: Country
  armyName: ArmyName
  general: GeneralDefinition
  filterNonCombat: boolean
}

const RenderGeneralSection = ({ country, armyName, general, filterNonCombat }: RenderGeneralProps) => {
  const panes = toArr(traitsIR.byParent(), (_, key: string) => ({
    menuItem: key,
    render: () => (
      <RenderTraitGroup
        country={country}
        general={general}
        armyName={armyName}
        parent={key}
        filterNonCombat={filterNonCombat}
      />
    )
  }))

  const dispatch = useDispatch()
  const handleToggleGeneral = () => {
    dispatch(setHasGeneral(country.name, armyName, !general.enabled))
  }
  const handleChange = (value: string) => {
    dispatch(setGeneralAttribute(country.name, armyName, CharacterAttribute.Martial, Number(value)))
  }

  return (
    <Grid.Row columns='1'>
      <Grid.Column>
        <AccordionToggle title='Army & General' identifier='countriesTraits'>
          <Checkbox
            toggle
            label='General'
            checked={general.enabled}
            onChange={handleToggleGeneral}
            style={{ float: 'right' }}
          />
          Base martial:{' '}
          <Input
            disabled={!general.enabled}
            type='number'
            value={general.baseValues[CharacterAttribute.Martial]}
            onChange={(_, { value }) => handleChange(value)}
          />{' '}
          with <StyledNumber value={general.extraValues[CharacterAttribute.Martial]} formatter={addSignWithZero} /> from
          traits
          <Tab panes={panes} />
          <RenderAbilities country={country} general={general} armyName={armyName} filterNonCombat={filterNonCombat} />
          <RenderDistinctions
            country={country}
            general={general}
            armyName={armyName}
            filterNonCombat={filterNonCombat}
          />
        </AccordionToggle>
      </Grid.Column>
    </Grid.Row>
  )
}

const getTopTraditionTree = (country: Country) => {
  const traditions = getSelections(country.selections, SelectionType.Tradition)
  const counts = groupBy(traditions.map(traditionsIR.get), item => item.parent)
  const countArray = toArr(counts, (value, key) => ({ key, value }))
  const max = maxBy(countArray, item => item.value)
  return max?.key ?? Object.keys(traditionsIR.byParent())[0]
}

const RenderTraditionSection = ({ country, filterNonCombat }: CountrySelectionProps) => {
  const [selectedTradition, selectTradition] = useState(getTopTraditionTree(country))
  const handleOnClick = useCountrySelection(country.name)
  useEffect(() => {
    selectTradition(getTopTraditionTree(country))
  }, [country])
  return (
    <Grid.Row columns='1'>
      <Grid.Column>
        <AccordionToggle title='Traditions' identifier='countriesTradition'>
          <Grid>
            <Grid.Row>
              <Grid.Column width='4'>
                <SimpleDropdown
                  values={Object.keys(traditionsIR.byParent()).map(name => ({ value: name, text: name }))}
                  value={selectedTradition}
                  style={{ width: 200 }}
                  onChange={selectTradition}
                />
              </Grid.Column>
              <Grid.Column width='8'>
                <div style={{ padding: '0.785714em' }}>
                  Military experience:{' '}
                  <CountryValueInput
                    attribute={CountryAttribute.MilitaryExperience}
                    country={country.name}
                    showEffect
                  />
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <TableModifierList
            selections={country.selections[SelectionType.Tradition]}
            columns={4}
            usePercentPadding
            type={SelectionType.Tradition}
            onClick={handleOnClick}
            items={traditionsIR.byParent(filterNonCombat)[selectedTradition]}
          />
        </AccordionToggle>
      </Grid.Column>
    </Grid.Row>
  )
}

const RenderAbilities = ({ country, armyName, general, filterNonCombat }: GeneralSelectionProps) => {
  const handleClick = useGeneralSelection(country.name, armyName)
  return (
    <DataEntriesByParent
      selections={general.selections[SelectionType.Ability]}
      type={SelectionType.Ability}
      entries={abilitiesIR.byParent(filterNonCombat)}
      onClick={handleClick}
      padding={PERCENT_PADDING}
      disabled={false}
    />
  )
}

const RenderDistinctions = ({ country, armyName, general, filterNonCombat }: GeneralSelectionProps) => {
  const handleClick = useGeneralSelection(country.name, armyName)
  return (
    <TableModifierList
      selections={general.selections[SelectionType.Distinction]}
      columns={4}
      usePercentPadding
      type={SelectionType.Distinction}
      onClick={handleClick}
      items={distinctionsIR.byIndex(filterNonCombat)}
    />
  )
}

const RenderTrades = ({ country, filterNonCombat }: CountrySelectionProps) => {
  const handleClick = useCountrySelection(country.name)
  return (
    <TableModifierList
      selections={country.selections[SelectionType.Trade]}
      columns={4}
      usePercentPadding
      type={SelectionType.Trade}
      onClick={handleClick}
      items={tradesIR.byIndex(filterNonCombat)}
    />
  )
}
const RenderHeritages = ({ country, filterNonCombat }: CountrySelectionProps) => {
  const handleClick = useCountrySelection(country.name)
  return (
    <DataEntryDropdown
      selections={country.selections[SelectionType.Heritage]}
      entries={heritagesIR.byIndex(filterNonCombat)}
      onClick={handleClick}
      type={SelectionType.Heritage}
    />
  )
}

const RenderFactions = ({ country, filterNonCombat }: CountrySelectionProps) => {
  const handleClick = useCountrySelection(country.name)
  return (
    <DataEntryDropdown
      selections={country.selections[SelectionType.Faction]}
      entries={factionsIR.byIndex(filterNonCombat)}
      onClick={handleClick}
      type={SelectionType.Faction}
    />
  )
}

const RenderReligions = ({ country, filterNonCombat }: CountrySelectionProps) => {
  const handleClick = useCountrySelection(country.name)
  return (
    <DataEntryDropdown
      selections={country.selections[SelectionType.Religion]}
      entries={religionsIR.byIndex(filterNonCombat)}
      onClick={handleClick}
      type={SelectionType.Faction}
    />
  )
}
const RenderTradeSection = ({ country, filterNonCombat }: CountrySelectionProps) => {
  return (
    <Grid.Row columns='1'>
      <Grid.Column>
        <AccordionToggle title='Trade surplus' identifier='countriesTrade'>
          <RenderTrades country={country} filterNonCombat={filterNonCombat} />
        </AccordionToggle>
      </Grid.Column>
    </Grid.Row>
  )
}

const RenderDeityGroup = ({ country, filterNonCombat, parent }: CountruSelectionGroupProps) => {
  const deities = deitiesIR.byParent(filterNonCombat)[parent]
  const rows = Math.ceil(deities.length / 4)
  const power = country[CountryAttribute.OmenPower]
  const selections = country.selections[SelectionType.Deity]
  const handleClick = useCountrySelection(country.name)
  return (
    <Table celled unstackable fixed>
      <Table.Body>
        {mapRange(rows, number => number).map(row => (
          <Table.Row key={row}>
            {mapRange(4, number => number).map(column => {
              const index = row * 4 + column
              const entity = deities[index]
              if (!entity) return <Table.Cell key={index}></Table.Cell>
              const key = entity.key
              const modifiers = entity.isOmen
                ? entity.modifiers.map(modifier => ({ ...modifier, value: (modifier.value * power) / 100 }))
                : entity.modifiers
              return (
                <RenderCell
                  key={key}
                  name={entity.name}
                  entryKey={key}
                  onClick={handleClick}
                  padding={PERCENT_PADDING}
                  modifiers={modifiers}
                  type={SelectionType.Deity}
                  enabled={selections?.[key]}
                />
              )
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const RenderDeities = ({ country, filterNonCombat }: CountrySelectionProps) => {
  const panes = toArr(deitiesIR.byParent(), (_, key: string) => ({
    menuItem: key,
    render: () => <RenderDeityGroup country={country} parent={key} filterNonCombat={filterNonCombat} />
  }))
  return <Tab panes={panes} />
}

const RenderReligionSection = ({ country, filterNonCombat }: CountrySelectionProps) => {
  return (
    <Grid.Row columns='1'>
      <Grid.Column>
        <AccordionToggle title='Religion & Deities' identifier='countriesDeities'>
          <RenderReligions country={country} filterNonCombat={filterNonCombat} />
          <br />
          <br />
          Omen power: <CountryValueInput attribute={CountryAttribute.OmenPower} country={country.name} />
          <List bulleted style={{ marginLeft: '2rem' }}>
            <List.Item>Religional unity: 0 - 100</List.Item>
            <List.Item>Tech level: 0 - 50</List.Item>
            <List.Item>Inventions: 0 - 30</List.Item>
            <List.Item>Office: 0 - 30</List.Item>
            <List.Item>Mandated Observance: 20</List.Item>
            <List.Item>Latin tradition: 15</List.Item>
            <List.Item>Exporting Incense: 10</List.Item>
            <List.Item>Laws: -15 / 15</List.Item>
            <List.Item>Ruler: -15 / 7.5)</List.Item>
            <List.Item>Heritage: 0 / 5)</List.Item>
            <List.Item>
              <b>Total from -30 to 300</b>
            </List.Item>
          </List>
          <RenderDeities country={country} filterNonCombat={filterNonCombat} />
        </AccordionToggle>
      </Grid.Column>
    </Grid.Row>
  )
}

export default connect(mapStateToProps, actions)(CountriesIR)
