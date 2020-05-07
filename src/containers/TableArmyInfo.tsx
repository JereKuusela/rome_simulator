import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Input } from 'semantic-ui-react'

import { SideType, CountryName, Setting, General, GeneralAttribute, GeneralValueType, CountryAttribute, ArmyName, UnitAttribute, isAttributeEnabled, UnitType } from 'types'
import { keys } from 'utils'
import { AppState, getCountry, getParticipant, getGeneral, getCountries, getMode, getSiteSettings, getArmies, getUnits } from 'state'
import { selectParticipantCountry, selectParticipantArmy, setGeneralAttribute } from 'reducers'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import StyledNumber from 'components/Utils/StyledNumber'
import TacticSelector from './TacticSelector'
import { addSign } from 'formatters'
import CountryValueInput from './CountryValueInput'
import { filterArmies } from 'managers/countries'
import AttributeImage from 'components/Utils/AttributeImage'
import UnitValueInput from './UnitValueInput'
import { getArchetypes2 } from 'managers/army'

type Props = {
  type: SideType
}

class TableArmyInfo extends Component<IProps> {

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
          {this.renderArmyInfo()}
        </Table.Body>
      </Table>
    )
  }


  renderArmyInfo = () => {
    const { artillery, settings, selectParticipantArmy, selectParticipantCountry, countries, mode, type, participant, armies, general } = this.props
    return (
      <Table.Row key={type}>
        <Table.Cell collapsing>
          <SimpleDropdown
            values={keys(countries)}
            value={participant.country}
            onChange={name => selectParticipantCountry(type, 0, name, Object.keys(filterArmies(countries[name], mode))[0] as ArmyName)}
            style={{ width: 110 }}
          />
        </Table.Cell>
        <Table.Cell collapsing>
          <SimpleDropdown
            values={keys(armies)}
            value={participant.army}
            onChange={name => selectParticipantArmy(type, 0, name)}
            style={{ width: 110 }}
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
          artillery && isAttributeEnabled(UnitAttribute.OffensiveSupport, settings) &&
          <Table.Cell>
            <UnitValueInput unit={artillery} attribute={UnitAttribute.OffensiveSupport} country={participant.country} percent />
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
  const units = getUnits(state, participant.country, participant.army)
  const mode = getMode(state)
  return {
    participant,
    general: getGeneral(state, participant.country, participant.army),
    country: getCountry(state, participant.country),
    countries: getCountries(state),
    armies: getArmies(state, participant.country),
    artillery: getArchetypes2(units, mode).find(unit => unit.type === UnitType.Artillery),
    settings: getSiteSettings(state),
    mode
  }
}

const actions = { selectParticipantCountry, selectParticipantArmy, setGeneralAttribute }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableArmyInfo)
