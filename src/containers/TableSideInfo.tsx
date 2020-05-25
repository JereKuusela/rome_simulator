import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table, Button } from 'semantic-ui-react'

import { SideType, CountryName, Setting, GeneralAttribute, UnitAttribute, CultureType, ModalType, GeneralDefinition, CombatPhase } from 'types'
import { AppState, getBattle, getMode, getCombatSide, getSiteSettings, getSide } from 'state'
import { selectParticipantCountry, selectParticipantArmy, selectCulture, toggleRandomDice, setDice, openModal, setGeneralAttribute } from 'reducers'
import StyledNumber from 'components/Utils/StyledNumber'
import { getCombatPhase, getCombatPhaseNumber } from 'combat'
import { addSign } from 'formatters'
import IconDice from 'images/chance.png'
import IconTerrain from 'images/terrain.png'
import AttributeImage from 'components/Utils/AttributeImage'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import LabelItem from 'components/Utils/LabelUnit'
import { getLeadingArmy, getDay } from 'managers/battle'

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
    const { settings, side, army } = this.props
    return (
      <Table.Row key={side.type}>
        <Table.Cell>
          {army ? army.general[GeneralAttribute.Martial] : 0}
          <AttributeImage attribute={GeneralAttribute.Martial} />
        </Table.Cell>
        {
          settings[Setting.Tactics] &&
          <Table.Cell collapsing>
            {army ? <LabelItem item={army.tactic} /> : null}
          </Table.Cell>
        }
        <Table.Cell>
          {this.renderRoll()}
        </Table.Cell>
      </Table.Row >
    )
  }

  renderGeneral = (general: GeneralDefinition, attribute: GeneralAttribute | CombatPhase) => {
    return (
      <Table.Cell>
        <AttributeImage attribute={attribute} />
        {general.values[attribute]}
      </Table.Cell>
    )
  }

  renderRoll = () => {
    const { settings, round, openModal, setDice, side, combat } = this.props
    const terrainPips = combat.results.terrainPips
    const generalPips = combat.results.generalPips
    const phase = getCombatPhaseNumber(round, settings)
    const isDiceSet = side.randomizeDice || (side.rolls.length > phase && side.rolls[phase])
    return (
      <div key={side.type}>
        <Image src={IconDice} avatar />
        {isDiceSet ? combat.results.dice : <DelayedNumericInput type='number' value={side.dice} onChange={value => setDice(side.type, value)} />}
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
  const combat = getCombatSide(state, props.type)
  return {
    side: getSide(state, props.type),
    army: getLeadingArmy(combat),
    round: getDay(battle),
    settings: getSiteSettings(state),
    mode: getMode(state),
    combat
  }
}

const actions = { selectParticipantCountry, selectParticipantArmy, selectCulture, toggleRandomDice, setDice, openModal, setGeneralAttribute }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableSideInfo)
