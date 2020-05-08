import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Input, Button } from 'semantic-ui-react'

import { SideType, CountryName, Setting, General, GeneralAttribute, GeneralValueType, isAttributeEnabled, CountryAttribute, ArmyName, Country, Armies, Participant, UnitType, UnitAttribute, Unit } from 'types'
import { keys } from 'utils'
import { AppState, getCountry, getGeneral, getCountries, getMode, getSiteSettings, getArmies, getSide, getUnits } from 'state'
import { selectParticipantCountry, selectParticipantArmy, setGeneralAttribute, deleteParticipant, addParticipant } from 'reducers'
import StyledNumber from 'components/Utils/StyledNumber'
import TacticSelector from './TacticSelector'
import { addSign } from 'formatters'
import CountryValueInput from './CountryValueInput'
import { filterArmies } from 'managers/countries'
import AttributeImage from 'components/Utils/AttributeImage'
import UnitValueInput from './UnitValueInput'
import { getArchetypes2 } from 'managers/army'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'

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
            <Table.HeaderCell>
              Country
            </Table.HeaderCell>
            <Table.HeaderCell>
              Army
            </Table.HeaderCell>
            {
              settings[Setting.Martial] &&
              <Table.HeaderCell collapsing>
                General skill
              </Table.HeaderCell>
            }
            {
              settings[Setting.Tactics] &&
              <Table.HeaderCell>
                Tactic
              </Table.HeaderCell>
            }
            {
              settings[Setting.Tech] &&
              <Table.HeaderCell>
                Tech
              </Table.HeaderCell>
            }
            {
              isAttributeEnabled(CountryAttribute.FlankRatio, settings) &&
              <Table.HeaderCell >
                <AttributeImage attribute={CountryAttribute.FlankRatio} settings={settings} />
              </Table.HeaderCell>
            }
            {
              isAttributeEnabled(UnitAttribute.OffensiveSupport, settings) &&
              <Table.HeaderCell>
                <AttributeImage attribute={UnitAttribute.OffensiveSupport} settings={settings} />
              </Table.HeaderCell>
            }
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
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }


  renderArmyInfo = (participant: Entity, index: number) => {
    const { settings, selectParticipantArmy, selectParticipantCountry, countries, mode, type, deleteParticipant, clearable } = this.props
    const { armies, general, countryName, armyName, artillery } = participant
    return (
      <Table.Row key={participant.countryName + '_' + participant.armyName + index}>
        <Table.Cell collapsing>
          <SimpleDropdown
            values={keys(countries)}
            value={countryName}
            onChange={name => name ? selectParticipantCountry(type, index, name, Object.keys(filterArmies(countries[name], mode))[0] as ArmyName) : deleteParticipant(type, index)}
            style={{ width: 100 }}
            clearable={clearable}
          />
        </Table.Cell>
        <Table.Cell collapsing>
          <SimpleDropdown
            values={keys(armies)}
            value={armyName}
            onChange={name => selectParticipantArmy(type, index, name)}
            style={{ width: 100 }}
          />
        </Table.Cell>
        {settings[Setting.Martial] && this.renderGeneralAttribute(countryName, armyName, general, GeneralAttribute.Martial)}
        {
          settings[Setting.Tactics] &&
          <Table.Cell collapsing>
            <TacticSelector side={type} index={index} />
          </Table.Cell>
        }
        {
          settings[Setting.Tech] &&
          <Table.Cell collapsing>
            <CountryValueInput country={countryName} attribute={CountryAttribute.TechLevel} />
          </Table.Cell>
        }
        {
          isAttributeEnabled(CountryAttribute.FlankRatio, settings) &&
          <Table.Cell>
            <CountryValueInput attribute={CountryAttribute.FlankRatio} country={countryName} percent />
          </Table.Cell>
        }
        {
          artillery && isAttributeEnabled(UnitAttribute.OffensiveSupport, settings) &&
          <Table.Cell>
            <UnitValueInput unit={artillery} attribute={UnitAttribute.OffensiveSupport} country={participant.countryName} percent />
          </Table.Cell>
        }
      </Table.Row >
    )
  }

  renderGeneralAttribute = (country: CountryName, army: ArmyName, general: General, attribute: GeneralValueType) => (
    <Table.Cell collapsing>
      <Input disabled={!general.enabled} size='mini' className='small-input' type='number' value={general.baseValues[attribute]} onChange={(_, { value }) => this.props.setGeneralAttribute(country, army, attribute, Number(value))} />
      {' '}<StyledNumber value={general.extraValues[attribute]} formatter={addSign} hideZero />
    </Table.Cell>
  )
}

type Entity = Participant & {
  general: General
  country: Country
  armies: Armies
  artillery?: Unit
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
      artillery: getArchetypes2(getUnits(state, participant.countryName, participant.armyName), mode).find(unit => unit.type === UnitType.Artillery)
    })),
    clearable: side.participants.length > 1,
    countries: getCountries(state),
    settings: getSiteSettings(state),
    mode
  }
}

const actions = { selectParticipantCountry, selectParticipantArmy, setGeneralAttribute, deleteParticipant, addParticipant }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableArmyInfo)
