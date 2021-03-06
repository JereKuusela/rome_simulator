import React from 'react'
import { useDispatch } from 'react-redux'
import { Table, Input, Button, InputOnChangeData } from 'semantic-ui-react'

import {
  SideType,
  CountryName,
  Setting,
  CharacterAttribute,
  GeneralValueType,
  isAttributeEnabled,
  CountryAttribute,
  ArmyName,
  Participant,
  UnitType,
  UnitAttribute
} from 'types'
import { keys } from 'utils'
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
import { useGeneral, useMode, useSide, useCombatSettings, useArmies, useCountries, useUnitDefinition } from 'selectors'

type Props = {
  type: SideType
}

const TableArmyInfo = ({ type }: Props): JSX.Element => {
  const settings = useCombatSettings()
  const dispatch = useDispatch()
  const participants = useSide(type).participants
  const last = participants[participants.length - 1]

  const handleAddParticipant = () => {
    dispatch(addParticipant(type, last.countryName, last.armyName))
  }
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
  const settings = useCombatSettings()
  const armies = useArmies(countryName)
  const artillery = useUnitDefinition(countryName, armyName, UnitType.Artillery)

  const handleSetDaysUntilBattle = (value: number) => {
    dispatch(setDaysUntilBattle(type, index, value))
  }

  const handleSelectCountry = (name: CountryName) => {
    dispatch(
      selectParticipantCountry(
        type,
        index,
        name,
        countries[name]
          ? (Object.keys(filterArmies(countries[name].armies, mode))[0] as ArmyName)
          : getDefaultArmyName(mode)
      )
    )
  }
  const handleDeleteParticipant = () => {
    dispatch(deleteParticipant(type, index))
  }
  const handleSelectArmy = (name: ArmyName) => {
    dispatch(selectParticipantArmy(type, index, name))
  }
  const handleCreateArmy = (name: ArmyName) => {
    dispatch(createArmy(countryName, name, mode))
  }

  const clearable = side.participants.length > 1

  return (
    <Table.Row key={countryName + '_' + armyName + index}>
      <Table.Cell>
        <SimpleDropdown
          values={keys(countries)}
          value={countryName}
          onChange={name => (name ? handleSelectCountry(name) : handleDeleteParticipant())}
          style={{ width: 110 }}
          onAdd={name => createCountry(name)}
          clearable={clearable}
        />
      </Table.Cell>
      <Table.Cell>
        <SimpleDropdown
          values={keys(armies)}
          value={armyName}
          onChange={handleSelectArmy}
          onAdd={handleCreateArmy}
          style={{ width: 100 }}
        />
      </Table.Cell>
      {settings[Setting.Martial] && (
        <TableGeneralAttribute attribute={CharacterAttribute.Martial} countryName={countryName} armyName={armyName} />
      )}
      {settings[Setting.Tactics] && (
        <Table.Cell>
          <TacticSelector side={type} index={index} />
        </Table.Cell>
      )}
      {settings[Setting.Tech] && (
        <Table.Cell>
          <CountryValueInput country={countryName} attribute={CountryAttribute.MartialTech} />
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
  const handleSetGeneralAttribute = (_: unknown, { value }: InputOnChangeData) => {
    dispatch(setGeneralAttribute(country, army, attribute, Number(value)))
  }
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
