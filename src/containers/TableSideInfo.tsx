import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table, Button } from 'semantic-ui-react'

import { SideType, CountryName, Setting, GeneralAttribute, UnitAttribute, CultureType, ModalType, General, CombatPhase } from 'types'
import { AppState, getBattle, getMode, getCombatParticipant, getSiteSettings, getCombatSide } from 'state'
import { selectParticipantCountry, selectParticipantArmy, selectCulture, toggleRandomDice, setDice, openModal, setGeneralAttribute } from 'reducers'
import StyledNumber from 'components/Utils/StyledNumber'
import { getTerrainPips, calculateGeneralPips, getCombatPhase, getCombatPhaseNumber } from 'combat'
import { addSign } from 'formatters'
import IconDice from 'images/chance.png'
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
              settings[Setting.FireAndShock] &&
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
    const { settings, side, tactic, round } = this.props
    return (
      <Table.Row key={side.type}>
        {settings[Setting.Martial] && this.renderGeneral(side.general, GeneralAttribute.Martial)}
        {settings[Setting.FireAndShock] && this.renderGeneral(side.general, getCombatPhase(round, settings) === CombatPhase.Shock ? CombatPhase.Shock : CombatPhase.Fire)}
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

  renderGeneral = (general: General, attribute: GeneralAttribute | CombatPhase) => {
    return (
      <Table.Cell>
        <AttributeImage attribute={attribute} />
        {general.totalValues[attribute]}
      </Table.Cell>
    )
  }

  renderRoll = () => {
    const { terrains, settings, round, openModal, setDice, side, opponent, combat } = this.props
    const terrainPips = getTerrainPips(terrains, side.type, side.general, opponent.general)
    const generalPips = calculateGeneralPips(side.general, opponent.general, getCombatPhase(round, settings))
    const phase = getCombatPhaseNumber(round, settings)
    const isDiceSet = side.randomizeDice || (side.rolls.length > phase && side.rolls[phase])
    return (
      <div key={side.type}>
        <Image src={IconDice} avatar />
        {isDiceSet ? combat.dice : <DelayedNumericInput type='number' value={side.dice} onChange={value => setDice(side.type, value)} />}
        {
          !side.randomizeDice &&
          <span style={{ paddingLeft: '1em' }}>
            <Button size='mini' icon={'plus'} onClick={() => openModal(ModalType.DiceRolls, { side: side.type })} />
          </span>
        }
        {
          generalPips !== 0 ?
            <span style={{ paddingLeft: '1em' }}>
              <AttributeImage attribute={getCombatPhase(round, settings)} />
              <StyledNumber value={generalPips} formatter={addSign} />
            </span>
            : null
        }
        {
          terrainPips !== 0 ?
            <span style={{ paddingLeft: '1em' }}>
              <Image src={IconTerrain} avatar />
              <StyledNumber value={terrainPips} formatter={addSign} />
            </span>
            : null
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
