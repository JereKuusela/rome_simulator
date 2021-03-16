import React, { Component } from 'react'
import { Container, Grid, Table, List, Input, Checkbox, Button, Tab } from 'semantic-ui-react'
import { connect, useDispatch } from 'react-redux'
import {
  AppState,
  getGeneral,
  getGeneralDefinition,
  getSiteSettings,
  getSelectedArmy,
  getCountryDefinition
} from 'state'
import { mapRange, values, keys, toArr } from '../utils'

import { addSignWithZero } from 'formatters'
import {
  ListDefinition,
  OptionDefinition,
  Modifier,
  CountryAttribute,
  GeneralAttribute,
  CombatPhase,
  GeneralValueType,
  filterAttributes,
  CountryName,
  SelectionType,
  ArmyName,
  Country,
  InventionDefinition
} from 'types'
import {
  clearCountryAttributes,
  setCountryAttribute,
  enableCountrySelections,
  enableCountrySelection,
  clearCountrySelections,
  clearCountrySelection,
  setGeneralAttribute,
  selectTradition,
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
import { convertCountryDefinition } from 'managers/countries'
import CountryValueInput from 'containers/CountryValueInput'
import ListModifier from 'components/Utils/ListModifier'
import DropdownListDefinition from 'components/Dropdowns/DropdownListDefinition'
import {
  traditionsIR,
  traitsIR,
  abilitiesIR,
  tradesIR,
  deitiesIR,
  lawsIR,
  policiesIR,
  ideasIR,
  effectsIR,
  heritagesIR,
  religionsIR,
  factionsIR,
  inventionsByCategoryIR
} from 'data'
import { TableModifierList } from 'components/TableModifierList'
import { noop } from 'lodash'
import { Tech } from 'types/generated'

const PERCENT_PADDING = '\u00a0\u00a0\u00a0\u00a0'

const CELL_PADDING = '.78571429em .78571429em'

class CountriesIR extends Component<IProps> {
  render() {
    const {
      settings,
      generalDefinition,
      general,
      filterNonCombat,
      setHasGeneral,
      countryDefinition,
      country
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
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='General' identifier='countriesTraits'>
                <Checkbox
                  toggle
                  label='General'
                  checked={general.enabled}
                  onChange={
                    general.enabled
                      ? () => this.execArmy(setHasGeneral, false)
                      : () => this.execArmy(setHasGeneral, true)
                  }
                  style={{ float: 'right' }}
                />
                Base martial:{' '}
                <Input
                  disabled={!general.enabled}
                  type='number'
                  value={general.baseValues[GeneralAttribute.Martial]}
                  onChange={(_, { value }) => this.setGeneralValue('Base', GeneralAttribute.Martial, Number(value))}
                />{' '}
                with <StyledNumber value={general.extraValues[GeneralAttribute.Martial]} formatter={addSignWithZero} />{' '}
                from traits
                <TableModifierList
                  selections={general.selections[SelectionType.Trait]}
                  columns={4}
                  type={SelectionType.Trait}
                  onClick={this.onCountryItemClick}
                  items={values(traitsIR)}
                  disabled={!general.enabled}
                />
                {this.renderAbilities()}
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Traditions' identifier='countriesTradition'>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width='4'>
                      <SimpleDropdown
                        values={Object.keys(traditionsIR).map(name => ({ value: name, text: name }))}
                        value={country.selectedTradition}
                        style={{ width: 200 }}
                        onChange={this.selectTradition}
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
                  onClick={this.onCountryItemClick}
                  items={traditionsIR[country.selectedTradition]}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Trade surplus' identifier='countriesTrade'>
                <TableModifierList
                  selections={country.selections[SelectionType.Trade]}
                  columns={4}
                  usePercentPadding
                  type={SelectionType.Trade}
                  onClick={this.onCountryItemClick}
                  items={values(tradesIR)}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <RenderTechAndInventions country={country} filterNonCombat={filterNonCombat} />
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Religion & Deities' identifier='countriesDeities'>
                {this.renderReligions()}
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
                {this.renderDeities()}
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Heritage, Government, Economy & Ideas' identifier='countriesGovernment'>
                <Grid padded>
                  <Grid.Row columns='3'>
                    <Grid.Column>{this.renderHeritages()}</Grid.Column>
                    <Grid.Column>{this.renderFactions()}</Grid.Column>
                  </Grid.Row>
                </Grid>
                <TableModifierList
                  selections={country.selections[SelectionType.Law]}
                  columns={3}
                  usePercentPadding
                  type={SelectionType.Law}
                  onClick={this.onCountryItemClick}
                  items={values(lawsIR)}
                />
                {this.renderPolicies()}
                <TableModifierList
                  selections={country.selections[SelectionType.Idea]}
                  columns={3}
                  usePercentPadding
                  type={SelectionType.Idea}
                  onClick={this.onCountryItemClick}
                  items={values(ideasIR)}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns='1'>
            <Grid.Column>
              <AccordionToggle title='Modifiers & Events' identifier='countries_modifiers'>
                <TableModifierList
                  selections={this.props.country.selections[SelectionType.Modifier]}
                  columns={4}
                  usePercentPadding
                  type={SelectionType.Modifier}
                  onClick={this.onCountryItemClick}
                  items={values(effectsIR)}
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
                    (values(GeneralAttribute) as GeneralValueType[]).concat(values(CombatPhase)),
                    settings
                  )}
                  customValueKey='Custom'
                  definition={generalDefinition}
                  onChange={this.setGeneralValue}
                />
              </AccordionToggle>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    )
  }

  renderDeities = () => {
    const deities = values(deitiesIR)
    const rows = Math.ceil(deities.length / 4)
    const power = this.props.country[CountryAttribute.OmenPower]
    const selections = this.props.country.selections[SelectionType.Deity]
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
                return this.renderCell2(
                  SelectionType.Deity,
                  key,
                  entity.name,
                  selections && selections[key],
                  modifiers,
                  this.onCountryItemClick,
                  PERCENT_PADDING
                )
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }

  renderHeritages = () => this.renderDropdown(SelectionType.Heritage, values(heritagesIR))
  renderReligions = () => this.renderDropdown(SelectionType.Religion, values(religionsIR))
  renderFactions = () => this.renderDropdown(SelectionType.Faction, values(factionsIR))

  renderDropdown = (type: SelectionType, items: ListDefinition[]) => {
    const selections = this.props.country.selections[type] ?? this.props.general.selections[type]
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

  renderPolicies = () =>
    this.renderOptions(SelectionType.Policy, policiesIR, 3, this.onCountryItemClick, false, PERCENT_PADDING)
  renderAbilities = () =>
    this.renderOptions(SelectionType.Ability, abilitiesIR, 2, this.onGeneralItemClick, false, PERCENT_PADDING)

  renderOptions = (
    type: SelectionType,
    options: OptionDefinition[],
    columns: number,
    onClick: (enabled: boolean) => (type: SelectionType, key: string) => void,
    disabled: boolean,
    padding?: string
  ) => {
    const selections = this.props.country.selections[type] ?? this.props.general.selections[type]
    return (
      <Table celled unstackable fixed>
        <Table.Body>
          {options.map((option, index) => (
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

  findOptionKeys = (options: OptionDefinition[], key: string) =>
    options.find(policy => policy.find(option => option.key === key))?.map(option => option.key)

  enableGeneralSelection = (type: SelectionType, key: string) => {
    const { enableGeneralSelection, clearGeneralSelections } = this.props
    if (type === SelectionType.Ability) {
      const keys = this.findOptionKeys(abilitiesIR, key)
      if (keys) this.execArmy(clearGeneralSelections, type, keys)
    }
    this.execArmy(enableGeneralSelection, type, key)
  }

  onGeneralItemClick = (enabled: boolean) => (enabled ? this.clearGeneralSelection : this.enableGeneralSelection)

  clearCountrySelection = (type: SelectionType, key: string) => {
    const { clearCountrySelection } = this.props
    this.execCountry(clearCountrySelection, type, key)
  }

  enableCountrySelection = (type: SelectionType, key: string) => {
    const { enableCountrySelection, clearCountrySelections } = this.props
    if (type === SelectionType.Heritage || type === SelectionType.Religion || type === SelectionType.Faction)
      this.execCountry(clearCountrySelections, type)
    if (type === SelectionType.Policy) {
      const keys = this.findOptionKeys(policiesIR, key)
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

  selectTradition = (value: string) => {
    this.execCountry(this.props.selectTradition, value)
  }

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
  const countryDefinition = getCountryDefinition(state, state.settings.country)
  return {
    countryDefinition,
    country: convertCountryDefinition(countryDefinition, state.settings.siteSettings),
    filterNonCombat: state.settings.filterNonCombat,
    selectedArmy,
    generalDefinition: getGeneralDefinition(state, state.settings.country, selectedArmy),
    general: getGeneral(state, state.settings.country, selectedArmy),
    settings: getSiteSettings(state)
  }
}

const actions = {
  clearGeneralSelections,
  setGeneralAttribute,
  selectTradition,
  setCountryAttribute,
  clearGeneralSelection,
  enableGeneralSelection,
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

type RenderInventionsProps = {
  country: Country
  inventions: InventionDefinition[]
  attribute: CountryAttribute
  filterNonCombat: boolean
}

const RenderInventions = ({ country, inventions, attribute, filterNonCombat }: RenderInventionsProps) => {
  const dispatch = useDispatch()

  const handleClearCountrySelection = (type: SelectionType, key: string) =>
    dispatch(clearCountrySelection(country.name, type, key))
  const handleEnableCountrySelection = (type: SelectionType, key: string) => {
    dispatch(enableCountrySelection(country.name, type, key))
  }

  const handleOnClick = (enabled: boolean) => (enabled ? handleClearCountrySelection : handleEnableCountrySelection)
  const filtered = filterNonCombat ? inventions.filter(invention => invention.relevant) : inventions
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
        items={filtered}
      />
    </>
  )
}

const RenderTechAndInventions = ({ country, filterNonCombat }: { country: Country; filterNonCombat: boolean }) => {
  const panes = toArr(inventionsByCategoryIR, (value, key) => ({
    menuItem: key,
    render: () => (
      <RenderInventions
        country={country}
        inventions={value}
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
export default connect(mapStateToProps, actions)(CountriesIR)
