import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table, Checkbox, Input, Button } from 'semantic-ui-react'

import { Side, CountryName, Setting, Participant, General, GeneralAttribute, GeneralValueType, UnitAttribute, isAttributeEnabled, Mode, UnitType, Unit, ValuesType, CountryAttribute, Country, CultureType, CombatParticipant, ModalType } from 'types'
import { keys } from 'utils'
import { AppState, getCountry, getParticipant, getGeneral, getCountryName, getSelectedTerrains, getCountries, getBattle, getUnit, getMode, getCombatParticipant, getSiteSettings } from 'state'
import { invalidate, selectArmy, selectCulture, toggleRandomDice, setDice, setGeneralStat, openModal } from 'reducers'
import Dropdown from 'components/Dropdowns/Dropdown'
import StyledNumber from 'components/Utils/StyledNumber'
import TacticSelector from './TacticSelector'
import { getCultures } from 'data'
import { getTerrainPips, calculateGeneralPips, getCombatPhase, getCombatPhaseNumber } from 'combat'
import { addSign } from 'formatters'
import IconDice from 'images/chance.png'
import IconGeneral from 'images/military_power.png'
import IconTerrain from 'images/terrain.png'
import UnitValueInput from './UnitValueInput'
import AttributeImage from 'components/Utils/AttributeImage'
import CountryValueInput from './CountryValueInput'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'

type Props = {
}

class TableArmyInfo extends Component<IProps> {

  attributes = [UnitAttribute.Discipline]

  render() {
    const { settings, participant_a, participant_d, country_a, country_d, general_a, general_d, unit_a, unit_d, combat_a, combat_d } = this.props
    return (
      <Table celled unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              Country
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
              isAttributeEnabled(UnitAttribute.Discipline, settings) &&
              <Table.HeaderCell>
                <AttributeImage attribute={UnitAttribute.Discipline} settings={settings} />
              </Table.HeaderCell>
            }
            {
              isAttributeEnabled(UnitAttribute.Morale, settings) &&
              <Table.HeaderCell>
                <AttributeImage attribute={UnitAttribute.Morale} settings={settings} />
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
            <Table.HeaderCell>
              Dice roll
            </Table.HeaderCell>
            <Table.HeaderCell>
              Randomize
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.renderArmyInfo(Side.Attacker, participant_a, combat_a, country_a, general_a, general_d, unit_a)}
          {this.renderArmyInfo(Side.Defender, participant_d, combat_d, country_d, general_d, general_a, unit_d)}
        </Table.Body>
      </Table >
    )
  }


  renderArmyInfo = (side: Side, participant: Participant, combat: CombatParticipant, country: Country, general: General, enemy: General, unit: Unit) => {
    const { settings } = this.props
    return (
      <Table.Row key={side}>
        <Table.Cell collapsing>
          <Dropdown
            values={keys(this.props.countries)}
            value={participant.country}
            onChange={name => this.selectArmy(side, name)}
            style={{ width: 150 }}
          />
        </Table.Cell>
        {settings[Setting.Martial] && this.renderGeneralAttribute(participant.country, general, GeneralAttribute.Martial)}
        {
          settings[Setting.Tactics] &&
          <Table.Cell collapsing>
            <TacticSelector side={side} />
          </Table.Cell>
        }
        {
          settings[Setting.Tech] &&
          <Table.Cell collapsing>
            <CountryValueInput country={participant.country} attribute={CountryAttribute.TechLevel} />
          </Table.Cell>
        }
        {
          isAttributeEnabled(UnitAttribute.Discipline, settings) &&
          <Table.Cell>
            <UnitValueInput unit={unit} attribute={UnitAttribute.Discipline} country={participant.country} percent />
          </Table.Cell>
        }
        {
          isAttributeEnabled(UnitAttribute.Morale, settings) &&
          <Table.Cell>
            <UnitValueInput unit={unit} attribute={UnitAttribute.Morale} country={participant.country} percent type={ValuesType.Modifier} />
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
        <Table.Cell>
          {this.renderRoll(side, participant, combat, general, enemy)}
        </Table.Cell>
        <Table.Cell collapsing>
          {this.renderIsRollRandom(side, participant.randomize_dice)}
        </Table.Cell>
      </Table.Row >
    )
  }

  renderGeneralAttribute = (country: CountryName, general: General, attribute: GeneralValueType) => (
    <Table.Cell collapsing>
      <Input disabled={!general.enabled} size='mini' className='small-input' type='number' value={general.base_values[attribute]} onChange={(_, { value }) => this.props.setGeneralStat(country, attribute, Number(value))} />
      {' '}<StyledNumber value={general.extra_values[attribute]} formatter={addSign} hide_zero />
    </Table.Cell>
  )

  renderRoll = (side: Side, participant: Participant, combat: CombatParticipant, general: General, opposing_general: General) => {
    const { terrains, settings, round, openModal } = this.props
    const terrain_pips = getTerrainPips(terrains, side, general, opposing_general)
    const general_pips = calculateGeneralPips(general, opposing_general, getCombatPhase(round, settings))
    const phase = getCombatPhaseNumber(round, settings)
    const is_dice_set = participant.randomize_dice || (participant.rolls.length > phase && participant.rolls[phase])
    return (
      <div key={side}>
        <Image src={IconDice} avatar />
        {is_dice_set ? combat.dice : <DelayedNumericInput type='number' value={participant.dice} onChange={value => this.props.setRoll(side, value) && this.props.invalidate()} />}
        {
          general_pips !== 0 ?
            <span style={{ paddingLeft: '1em' }}>
              <Image src={IconGeneral} avatar />
              <StyledNumber value={general_pips} formatter={addSign} />
            </span>
            : null
        }
        {
          terrain_pips !== 0 ?
            <span style={{ paddingLeft: '1em' }}>
              <Image src={IconTerrain} avatar />
              <StyledNumber value={terrain_pips} formatter={addSign} />
            </span>
            : null
        }
        {
          !participant.randomize_dice &&
          <span style={{ paddingLeft: '1em' }}>
            <Button size='mini' icon={'plus'} onClick={() => openModal(ModalType.DiceRolls, { side })} />
          </span>
        }
      </div >
    )
  }

  renderIsRollRandom = (side: Side, is_random: boolean) => {
    return (
      <Checkbox toggle checked={is_random} onClick={() => this.props.toggleRandomRoll(side) && this.props.invalidate()} />
    )
  }

  selectCulture = (country: CountryName, culture: CultureType) => {
    const { selectCulture, invalidate } = this.props
    selectCulture(country, culture, false)
    invalidate()
  }

  selectArmy = (side: Side, country: CountryName) => {
    const { selectArmy, invalidate } = this.props
    selectArmy(side, country)
    invalidate()
  }
}

const mapStateToProps = (state: AppState) => ({
  participant_a: getParticipant(state, Side.Attacker),
  participant_d: getParticipant(state, Side.Defender),
  combat_a: getCombatParticipant(state, Side.Attacker),
  combat_d: getCombatParticipant(state, Side.Defender),
  general_a: getGeneral(state, getCountryName(state, Side.Attacker)),
  general_d: getGeneral(state, getCountryName(state, Side.Defender)),
  country_a: getCountry(state, getCountryName(state, Side.Attacker)),
  country_d: getCountry(state, getCountryName(state, Side.Defender)),
  terrains: getSelectedTerrains(state),
  countries: getCountries(state),
  round: getBattle(state).round,
  unit_a: getUnit(state, getMode(state) === Mode.Naval ? UnitType.Naval : UnitType.Land, getParticipant(state, Side.Attacker).country),
  unit_d: getUnit(state, getMode(state) === Mode.Naval ? UnitType.Naval : UnitType.Land, getParticipant(state, Side.Defender).country),
  settings: getSiteSettings(state)
})

const actions = { invalidate, selectArmy, selectCulture, toggleRandomRoll: toggleRandomDice, setRoll: setDice, setGeneralStat, openModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableArmyInfo)
