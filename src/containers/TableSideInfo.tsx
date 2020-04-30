import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table, Button } from 'semantic-ui-react'

import { SideType, CountryName, Setting, GeneralAttribute, UnitAttribute, CultureType, ModalType } from 'types'
import { AppState, getBattle, getMode, getCombatParticipant, getSiteSettings, getCombatSide } from 'state'
import { selectParticipantCountry, selectParticipantArmy, selectCulture, toggleRandomDice, setDice, openModal, setGeneralAttribute } from 'reducers'
import StyledNumber from 'components/Utils/StyledNumber'
import { getTerrainPips, calculateGeneralPips, getCombatPhase, getCombatPhaseNumber } from 'combat'
import { addSign } from 'formatters'
import IconDice from 'images/chance.png'
import IconGeneral from 'images/military_power.png'
import IconTerrain from 'images/terrain.png'
import AttributeImage from 'components/Utils/AttributeImage'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import LabelItem from 'components/Utils/LabelUnit'
import { getOpponent } from 'army_utils'

type Props = {
  type: SideType
}

class TableSideInfo extends Component<IProps> {

  attributes = [UnitAttribute.Discipline]

  render() {
    const { settings } = this.props
    return (
      <Table celled unstackable>
        <Table.Header>
          <Table.Row>
            {
              settings[Setting.Martial] &&
              <Table.HeaderCell>
                General
              </Table.HeaderCell>
            }
            {
              settings[Setting.Tactics] &&
              <Table.HeaderCell>
                Tactic
              </Table.HeaderCell>
            }
            <Table.HeaderCell>
              Dice roll
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.renderSide()}
        </Table.Body>
      </Table >
    )
  }


  renderSide = () => {
    const { settings, side, tactic } = this.props
    return (
      <Table.Row key={side.type}>
        <Table.Cell>
          {side.general.total_values[GeneralAttribute.Martial]}
          <AttributeImage attribute={GeneralAttribute.Martial} />
        </Table.Cell>
        {
          settings[Setting.Tactics] &&
          <Table.Cell collapsing>
            <LabelItem item={tactic} />
          </Table.Cell>
        }
        <Table.Cell>
          {this.renderRoll()}
        </Table.Cell>
      </Table.Row >
    )
  }

  renderRoll = () => {
    const { terrains, settings, round, openModal, setDice, side, opponent, combat } = this.props
    const terrain_pips = getTerrainPips(terrains, side.type, side.general, opponent.general)
    const general_pips = calculateGeneralPips(side.general, opponent.general, getCombatPhase(round, settings))
    const phase = getCombatPhaseNumber(round, settings)
    const is_dice_set = side.randomize_dice || (side.rolls.length > phase && side.rolls[phase])
    return (
      <div key={side.type}>
        <Image src={IconDice} avatar />
        {is_dice_set ? combat.dice : <DelayedNumericInput type='number' value={side.dice} onChange={value => setDice(side.type, value)} />}
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
          !side.randomize_dice &&
          <span style={{ paddingLeft: '1em' }}>
            <Button size='mini' icon={'plus'} onClick={() => openModal(ModalType.DiceRolls, { side: side.type })} />
          </span>
        }
      </div >
    )
  }

  selectCulture = (country: CountryName, culture: CultureType) => {
    const { selectCulture } = this.props
    selectCulture(country, culture, false)
  }
}

const mapStateToProps = (state: AppState, props: Props) => {
  const battle = getBattle(state)
  const side = getCombatSide(state, props.type)
  const opponent = getCombatSide(state, getOpponent(props.type))
  return {
    side,
    opponent,
    tactic: state.tactics[side.tactic],
    round: battle.round,
    terrains: battle.terrains.map(type => state.terrains[type]),
    settings: getSiteSettings(state),
    mode: getMode(state),
    combat: getCombatParticipant(state, props.type)
  }
}

const actions = { selectParticipantCountry, selectParticipantArmy, selectCulture, toggleRandomDice, setDice, openModal, setGeneralAttribute }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableSideInfo)
