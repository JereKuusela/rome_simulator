import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Input, Button } from 'semantic-ui-react'

import {
  SideType,
  CountryName,
  Setting,
  GeneralDefinition,
  GeneralAttribute,
  GeneralValueType,
  isAttributeEnabled,
  CountryAttribute,
  ArmyName,
  Country,
  Armies,
  Participant,
  UnitType,
  UnitAttribute,
  UnitDefinition
} from 'types'
import { keys } from 'utils'
import {
  AppState,
  getCountry,
  getGeneral,
  getCountries,
  getMode,
  getSiteSettings,
  getArmies,
  getSide,
  getUnitDefinitions
} from 'state'
import {
  selectParticipantCountry,
  selectParticipantArmy,
  setGeneralAttribute,
  deleteParticipant,
  addParticipant,
  setDaysUntilBattle,
  createArmy,
  createCountry
} from 'reducers'
import StyledNumber from 'components/Utils/StyledNumber'
import TacticSelector from './TacticSelector'
import { addSign } from 'formatters'
import CountryValueInput from './CountryValueInput'
import { filterArmies } from 'managers/countries'
import AttributeImage from 'components/Utils/AttributeImage'
import UnitValueInput from './UnitValueInput'
import { getArchetypes } from 'managers/army'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { getDefaultArmyName } from 'data'

type Props = {
  type: SideType
}

class TableArmyInfo extends Component<IProps> {
  render() {
    const { settings, participants, addParticipant, type } = this.props
    const last = participants[participants.length - 1]
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Country</Table.HeaderCell>
            <Table.HeaderCell>Army</Table.HeaderCell>
            {settings[Setting.Martial] && <Table.HeaderCell>General</Table.HeaderCell>}
            {settings[Setting.Tactics] && <Table.HeaderCell>Tactic</Table.HeaderCell>}
            {settings[Setting.Tech] && <Table.HeaderCell>Tech</Table.HeaderCell>}
            {isAttributeEnabled(CountryAttribute.FlankRatio, settings) && (
              <Table.HeaderCell>
                <AttributeImage attribute={CountryAttribute.FlankRatio} settings={settings} />
              </Table.HeaderCell>
            )}
            {isAttributeEnabled(UnitAttribute.OffensiveSupport, settings) && (
              <Table.HeaderCell>
                <AttributeImage attribute={UnitAttribute.OffensiveSupport} settings={settings} />
              </Table.HeaderCell>
            )}
            <Table.HeaderCell>Days</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {participants.map(this.renderArmyInfo)}
          <Table.Row>
            <Table.Cell>
              <Button size='mini' icon={'plus'} onClick={() => addParticipant(type, last.countryName, last.armyName)} />
            </Table.Cell>
            <Table.Cell />
            <Table.Cell />
            <Table.Cell />
            <Table.Cell />
            <Table.Cell />
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderArmyInfo = (participant: Entity, index: number) => {
    const {
      settings,
      selectParticipantArmy,
      selectParticipantCountry,
      countries,
      mode,
      type,
      deleteParticipant,
      clearable,
      createArmy,
      createCountry
    } = this.props
    const { armies, general, countryName, armyName, artillery } = participant
    return (
      <Table.Row key={participant.countryName + '_' + participant.armyName + index}>
        <Table.Cell>
          <SimpleDropdown
            values={keys(countries)}
            value={countryName}
            onChange={name =>
              name
                ? selectParticipantCountry(
                    type,
                    index,
                    name,
                    countries[name]
                      ? (Object.keys(filterArmies(countries[name], mode))[0] as ArmyName)
                      : getDefaultArmyName(mode)
                  )
                : deleteParticipant(type, index)
            }
            style={{ width: 110 }}
            onAdd={name => createCountry(name)}
            clearable={clearable}
          />
        </Table.Cell>
        <Table.Cell>
          <SimpleDropdown
            values={keys(armies)}
            value={armyName}
            onChange={name => selectParticipantArmy(type, index, name)}
            onAdd={name => createArmy(countryName, name, mode)}
            style={{ width: 100 }}
          />
        </Table.Cell>
        {settings[Setting.Martial] &&
          this.renderGeneralAttribute(countryName, armyName, general, GeneralAttribute.Martial)}
        {settings[Setting.Tactics] && (
          <Table.Cell>
            <TacticSelector side={type} index={index} />
          </Table.Cell>
        )}
        {settings[Setting.Tech] && (
          <Table.Cell>
            <CountryValueInput country={countryName} attribute={CountryAttribute.TechLevel} />
          </Table.Cell>
        )}
        {isAttributeEnabled(CountryAttribute.FlankRatio, settings) && (
          <Table.Cell>
            <CountryValueInput attribute={CountryAttribute.FlankRatio} country={countryName} percent />
          </Table.Cell>
        )}
        {artillery && isAttributeEnabled(UnitAttribute.OffensiveSupport, settings) && (
          <Table.Cell>
            <UnitValueInput
              unit={artillery}
              attribute={UnitAttribute.OffensiveSupport}
              country={participant.countryName}
              percent
            />
          </Table.Cell>
        )}
        <Table.Cell>
          <DelayedNumericInput
            disabled={index === 0}
            value={participant.daysUntilBattle}
            onChange={value => this.setDaysUntilBattle(index, value)}
            type='number'
          />
        </Table.Cell>
      </Table.Row>
    )
  }

  renderGeneralAttribute = (
    country: CountryName,
    army: ArmyName,
    general: GeneralDefinition,
    attribute: GeneralValueType
  ) => (
    <Table.Cell>
      <Input
        disabled={!general.enabled}
        size='mini'
        className='small-input'
        type='number'
        value={general.baseValues[attribute]}
        onChange={(_, { value }) => this.props.setGeneralAttribute(country, army, attribute, Number(value))}
      />{' '}
      <StyledNumber value={general.extraValues[attribute]} formatter={addSign} hideZero />
    </Table.Cell>
  )

  setDaysUntilBattle = (index: number, value: number) => {
    this.props.setDaysUntilBattle(this.props.type, index, value)
  }
}

type Entity = Participant & {
  general: GeneralDefinition
  country: Country
  armies: Armies
  artillery?: UnitDefinition
}

const mapStateToProps = (state: AppState, props: Props) => {
  const side = getSide(state, props.type)
  const mode = getMode(state)
  return {
    participants: side.participants.map(participant => ({
      ...participant,
      general: getGeneral(state, participant.countryName, participant.armyName),
      country: getCountry(state, participant.countryName),
      armies: getArmies(state, participant.countryName),
      artillery: getArchetypes(getUnitDefinitions(state, participant.countryName, participant.armyName), mode).find(
        unit => unit.type === UnitType.Artillery
      )
    })),
    clearable: side.participants.length > 1,
    countries: getCountries(state),
    settings: getSiteSettings(state),
    mode
  }
}

const actions = {
  selectParticipantCountry,
  selectParticipantArmy,
  setGeneralAttribute,
  deleteParticipant,
  addParticipant,
  setDaysUntilBattle,
  createArmy,
  createCountry
}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D {}

export default connect(mapStateToProps, actions)(TableArmyInfo)
