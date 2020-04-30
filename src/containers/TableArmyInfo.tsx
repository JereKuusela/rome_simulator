import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Input } from 'semantic-ui-react'

import { SideType, CountryName, Setting, General, GeneralAttribute, GeneralValueType, isAttributeEnabled, Mode, UnitType, CountryAttribute, CultureType, ArmyName } from 'types'
import { keys } from 'utils'
import { AppState, getCountry, getParticipant, getGeneral, getCountries, getUnit, getMode, getSiteSettings, getArmies } from 'state'
import { selectParticipantCountry, selectParticipantArmy, selectCulture, setGeneralAttribute } from 'reducers'
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
    const { settings } = this.props
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
          {this.renderArmyInfo()}
        </Table.Body>
      </Table >
    )
  }


  renderArmyInfo = () => {
    const { settings, selectParticipantArmy, selectParticipantCountry, countries, mode, type, participant, armies, general, country } = this.props
    return (
      <Table.Row key={type}>
        <Table.Cell collapsing>
          <Dropdown
            values={keys(countries)}
            value={participant.country}
            onChange={name => selectParticipantCountry(type, 0, name, Object.keys(filterArmies(countries[name], mode))[0] as ArmyName)}
            style={{ width: 100 }}
          />
        </Table.Cell>
        <Table.Cell collapsing>
          <Dropdown
            values={keys(armies)}
            value={participant.army}
            onChange={name => selectParticipantArmy(type, 0, name)}
            style={{ width: 100 }}
          />
        </Table.Cell>
        {settings[Setting.Martial] && this.renderGeneralAttribute(participant.country, participant.army, general, GeneralAttribute.Martial)}
        {
          settings[Setting.Tactics] &&
          <Table.Cell collapsing>
            <TacticSelector side={type} />
          </Table.Cell>
        }
        {
          settings[Setting.Tech] &&
          <Table.Cell collapsing>
            <CountryValueInput country={participant.country} attribute={CountryAttribute.TechLevel} />
          </Table.Cell>
        }
        {
          isAttributeEnabled(CountryAttribute.FlankRatio, settings) &&
          <Table.Cell>
            <CountryValueInput attribute={CountryAttribute.FlankRatio} country={participant.country} percent />
          </Table.Cell>
        }
        {
          settings[Setting.Culture] &&
          <Table.Cell collapsing>
            <Dropdown
              values={getCultures()}
              value={country.culture}
              onChange={item => this.selectCulture(participant.country, item)}
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

const mapStateToProps = (state: AppState, props: Props) => {
  const participant = getParticipant(state, props.type)
  return {
    participant,
    general: getGeneral(state, participant.country, participant.army),
    country: getCountry(state, participant.country),
    countries: getCountries(state),
    armies: getArmies(state, participant.country),
    unit: getUnit(state, getMode(state) === Mode.Naval ? UnitType.Naval : UnitType.Land, participant.country, participant.army),
    settings: getSiteSettings(state),
    mode: getMode(state)
  }
}

const actions = { selectParticipantCountry, selectParticipantArmy, selectCulture, setGeneralAttribute }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableArmyInfo)
