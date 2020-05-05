import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Input } from 'semantic-ui-react'

import { SideType, CountryName, Setting, General, GeneralAttribute, GeneralValueType, CountryAttribute, ArmyName, UnitAttribute, isAttributeEnabled, filterAttributes } from 'types'
import { keys } from 'utils'
import { AppState, getCountry, getParticipant, getGeneral, getCountries, getMode, getSiteSettings, getArmies, getUnits } from 'state'
import { selectParticipantCountry, selectParticipantArmy, setGeneralAttribute } from 'reducers'
import Dropdown from 'components/Dropdowns/Dropdown'
import StyledNumber from 'components/Utils/StyledNumber'
import TacticSelector from './TacticSelector'
import { addSign } from 'formatters'
import CountryValueInput from './CountryValueInput'
import { filterArmies } from 'managers/countries'
import AttributeImage from 'components/Utils/AttributeImage'
import UnitValueInput from './UnitValueInput'
import { getRootUnit } from 'managers/army'

type Props = {
  type: SideType
}

class TableArmyInfo extends Component<IProps> {

  getAttributes = () => {
    if (process.env.REACT_APP_GAME === 'euiv')
      return [UnitAttribute.Morale, UnitAttribute.Discipline]
    else {
      return []
    }
  }

  render() {
    const { settings } = this.props
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
              filterAttributes(this.getAttributes(), settings).map(attribute => (
                <Table.HeaderCell key={attribute}>
                  <AttributeImage attribute={attribute} settings={settings} />
                </Table.HeaderCell>
              ))
            }
            {
              isAttributeEnabled(CountryAttribute.FlankRatio, settings) &&
              <Table.HeaderCell >
                <AttributeImage attribute={CountryAttribute.FlankRatio} settings={settings} />
              </Table.HeaderCell>
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.renderArmyInfo()}
        </Table.Body>
      </Table>
    )
  }


  renderArmyInfo = () => {
    const { settings, selectParticipantArmy, selectParticipantCountry, countries, mode, type, participant, armies, general, unit } = this.props
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
          filterAttributes(this.getAttributes(), settings).map(attribute => (
            <Table.Cell key={attribute}>
              <UnitValueInput unit={unit} attribute={attribute} country={participant.country} percent />
            </Table.Cell>
          ))
        }
        {
          isAttributeEnabled(CountryAttribute.FlankRatio, settings) &&
          <Table.Cell>
            <CountryValueInput attribute={CountryAttribute.FlankRatio} country={participant.country} percent />
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
}

const mapStateToProps = (state: AppState, props: Props) => {
  const participant = getParticipant(state, props.type)
  return {
    participant,
    general: getGeneral(state, participant.country, participant.army),
    country: getCountry(state, participant.country),
    countries: getCountries(state),
    armies: getArmies(state, participant.country),
    unit: getRootUnit(getUnits(state, participant.country, participant.army), getMode(state)),
    settings: getSiteSettings(state),
    mode: getMode(state)
  }
}

const actions = { selectParticipantCountry, selectParticipantArmy, setGeneralAttribute }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableArmyInfo)
