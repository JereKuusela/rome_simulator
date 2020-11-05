import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Table, Input, Button, InputOnChangeData } from 'semantic-ui-react'

import {
  SideType,
  CountryName,
  Setting,
  GeneralAttribute,
  GeneralValueType,
  isAttributeEnabled,
  CountryAttribute,
  ArmyName,
  Participant,
  UnitType,
  UnitAttribute
} from 'types'
import { keys } from 'utils'
import { useGeneral, useCountries, useMode, useSide, useSiteSettings, useArmies, useUnitDefinition } from 'state'
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
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { getDefaultArmyName } from 'data'

type Props = {
  type: SideType
}

const TableArmyInfo = ({ type }: Props): JSX.Element => {
  const settings = useSiteSettings()
  const dispatch = useDispatch()
  const participants = useSide(type).participants

  const last = participants[participants.length - 1]

  const handleAddParticipant = useCallback(() => {
    dispatch(addParticipant(type, last.countryName, last.armyName))
  }, [dispatch, type, last])
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
        {participants.map((item, index) => (
          <ArmyInfo index={index} participant={item} type={type} key={index} />
        ))}
        <Table.Row>
          <Table.Cell>
            <Button size='mini' icon={'plus'} onClick={handleAddParticipant} />
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

interface ArmyInfoProps {
  type: SideType
  index: number
  participant: Participant
}

const ArmyInfo = ({ type, participant, index }: ArmyInfoProps) => {
  const { daysUntilBattle, armyName, countryName } = participant
  const dispatch = useDispatch()
  const countries = useCountries()
  const mode = useMode()
  const side = useSide(type)
  const settings = useSiteSettings()
  const armies = useArmies(countryName)
  const artillery = useUnitDefinition(countryName, armyName, UnitType.Artillery)

  const handleSetDaysUntilBattle = useCallback(
    (value: number) => {
      dispatch(setDaysUntilBattle(type, index, value))
    },
    [dispatch, index, type]
  )
  const clearable = side.participants.length > 1

  return (
    <Table.Row key={countryName + '_' + armyName + index}>
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
      {settings[Setting.Martial] && (
        <TableGeneralAttribute attribute={GeneralAttribute.Martial} countryName={countryName} armyName={armyName} />
      )}
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
          <UnitValueInput unit={artillery} attribute={UnitAttribute.OffensiveSupport} country={countryName} percent />
        </Table.Cell>
      )}
      <Table.Cell>
        <DelayedNumericInput
          disabled={index === 0}
          value={daysUntilBattle}
          onChange={handleSetDaysUntilBattle}
          type='number'
        />
      </Table.Cell>
    </Table.Row>
  )
}

interface GeneralAttributeProps {
  countryName: CountryName
  armyName: ArmyName
  attribute: GeneralValueType
}

const TableGeneralAttribute = ({ countryName: country, armyName: army, attribute }: GeneralAttributeProps) => {
  const dispatch = useDispatch()
  const general = useGeneral(country, army)
  const handleSetGeneralAttribute = useCallback(
    (_, { value }: InputOnChangeData) => {
      dispatch(setGeneralAttribute(country, army, attribute, Number(value)))
    },
    [dispatch, country, army, attribute]
  )
  if (!general) return null
  return (
    <Table.Cell>
      <Input
        disabled={!general.enabled}
        size='mini'
        className='small-input'
        type='number'
        value={general.baseValues[attribute]}
        onChange={handleSetGeneralAttribute}
      />{' '}
      <StyledNumber value={general.extraValues[attribute]} formatter={addSign} hideZero />
    </Table.Cell>
  )
}

export default TableArmyInfo
