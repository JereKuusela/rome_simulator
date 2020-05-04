import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Input, Button } from 'semantic-ui-react'

import { SideType, CountryName, Setting, General, GeneralAttribute, GeneralValueType, isAttributeEnabled, CountryAttribute, CultureType, ArmyName, Country, Armies, Participant } from 'types'
import { keys } from 'utils'
import { AppState, getCountry, getGeneral, getCountries, getMode, getSiteSettings, getArmies, getSide } from 'state'
import { selectParticipantCountry, selectParticipantArmy, selectCulture, setGeneralAttribute, deleteParticipant, addParticipant } from 'reducers'
import Dropdown from 'components/Dropdowns/Dropdown'
import StyledNumber from 'components/Utils/StyledNumber'
import TacticSelector from './TacticSelector'
import { getCultures } from 'data'
import { addSign } from 'formatters'
import AttributeImage from 'components/Utils/AttributeImage'
import CountryValueInput from './CountryValueInput'
import { filterArmies } from 'managers/countries'

type Props = {
  type: SideType
}

class TableArmyInfo extends Component<IProps> {

  render() {
    const { settings, participants, addParticipant, type } = this.props
    const last = participants[participants.length - 1]
    return (
      <Table celled unstackable>
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
              settings[Setting.Culture] &&
              <Table.HeaderCell>
                Culture
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
    const { country, armies, general, countryName, armyName } = participant
    return (
      <Table.Row key={participant.countryName + '_' + participant.armyName + index}>
        <Table.Cell collapsing>
          <Dropdown
            values={keys(countries)}
            value={countryName}
            onChange={name => name ? selectParticipantCountry(type, index, name, Object.keys(filterArmies(countries[name], mode))[0] as ArmyName) : deleteParticipant(type, index)}
            style={{ width: 100 }}
            clearable={clearable}
          />
        </Table.Cell>
        <Table.Cell collapsing>
          <Dropdown
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
          settings[Setting.Culture] &&
          <Table.Cell collapsing>
            <Dropdown
              values={getCultures()}
              value={country.culture}
              onChange={item => this.selectCulture(countryName, item)}
              style={{ width: 150 }}
            />
          </Table.Cell>
        }
      </Table.Row >
    )
  }

  renderGeneralAttribute = (country: CountryName, army: ArmyName, general: General, attribute: GeneralValueType) => (
    <Table.Cell collapsing>
      <Input disabled={!general.enabled} size='mini' className='small-input' type='number' value={general.base_values[attribute]} onChange={(_, { value }) => this.props.setGeneralAttribute(country, army, attribute, Number(value))} />
      {' '}<StyledNumber value={general.extra_values[attribute]} formatter={addSign} hide_zero />
    </Table.Cell>
  )

  selectCulture = (country: CountryName, culture: CultureType) => {
    const { selectCulture } = this.props
    selectCulture(country, culture, false)
  }
}

type Entity = Participant & {
  general: General
  country: Country
  armies: Armies
}

const mapStateToProps = (state: AppState, props: Props) => {
  const side = getSide(state, props.type)
  return {
    participants: side.participants.map(participant => ({
      ...participant,
      general: getGeneral(state, participant.countryName, participant.armyName),
      country: getCountry(state, participant.countryName),
      armies: getArmies(state, participant.countryName),
    })),
    clearable: side.participants.length > 1,
    countries: getCountries(state),
    settings: getSiteSettings(state),
    mode: getMode(state)
  }
}

const actions = { selectParticipantCountry, selectParticipantArmy, selectCulture, setGeneralAttribute, deleteParticipant, addParticipant }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableArmyInfo)
