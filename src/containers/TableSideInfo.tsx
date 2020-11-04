import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table, Button } from 'semantic-ui-react'

import { SideType, Setting, GeneralAttribute, UnitAttribute, ModalType, GeneralDefinition, CombatPhase } from 'types'
import { AppState, getBattle, getMode, getCombatSide, getSiteSettings, getSide, getTactic } from 'state'
import { setDice, openModal } from 'reducers'
import StyledNumber from 'components/Utils/StyledNumber'
import { getCombatPhase, getCombatPhaseNumber } from 'combat'
import { addSign, toSignedPercent } from 'formatters'
import IconDice from 'images/chance.png'
import IconTerrain from 'images/terrain.png'
import AttributeImage from 'components/Utils/AttributeImage'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { getLeadingArmy, getDay, getParticipantName } from 'managers/battle'
import { getImage } from 'utils'

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
            <Table.HeaderCell>Leader</Table.HeaderCell>
            {settings[Setting.Martial] && <Table.HeaderCell>General</Table.HeaderCell>}
            {settings[Setting.FireAndShock] && <Table.HeaderCell>General</Table.HeaderCell>}
            {settings[Setting.Tactics] && <Table.HeaderCell>Tactic</Table.HeaderCell>}
            <Table.HeaderCell>Dice roll</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>{this.renderSide()}</Table.Body>
      </Table>
    )
  }

  renderSide = () => {
    const { settings, side, army, tactic } = this.props
    const participantIndex = army?.participantIndex ?? 0
    return (
      <Table.Row key={side.type}>
        <Table.Cell>{getParticipantName(side.participants[participantIndex])}</Table.Cell>
        <Table.Cell>
          <AttributeImage attribute={GeneralAttribute.Martial} />
          {army ? army.general[GeneralAttribute.Martial] : 0}
        </Table.Cell>
        {settings[Setting.Tactics] && (
          <Table.Cell collapsing>
            {army ? <Image src={getImage(army.tactic)} avatar /> : null}
            {tactic ? <StyledNumber value={tactic.damage} formatter={toSignedPercent} /> : null}
          </Table.Cell>
        )}
        <Table.Cell>{this.renderRoll()}</Table.Cell>
      </Table.Row>
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
        {isDiceSet ? (
          combat.results.dice
        ) : (
          <DelayedNumericInput type='number' value={side.dice} onChange={value => setDice(side.type, value)} />
        )}
        <span style={{ paddingLeft: '1em' }}>
          <Button size='mini' icon={'plus'} onClick={() => openModal(ModalType.DiceRolls, { side: side.type })} />
        </span>
        {generalPips !== 0 ? (
          <span style={{ paddingLeft: '1em' }}>
            <AttributeImage attribute={getCombatPhase(round, settings)} />
            <StyledNumber value={generalPips} formatter={addSign} />
          </span>
        ) : null}
        {terrainPips !== 0 ? (
          <span style={{ paddingLeft: '1em' }}>
            <Image src={IconTerrain} avatar />
            <StyledNumber value={terrainPips} formatter={addSign} />
          </span>
        ) : null}
      </div>
    )
  }
}

const mapStateToProps = (state: AppState, props: Props) => {
  const battle = getBattle(state)
  const combat = getCombatSide(state, props.type)
  const army = getLeadingArmy(combat)
  return {
    side: getSide(state, props.type),
    tactic: getTactic(state, combat.type),
    army,
    round: getDay(battle),
    settings: getSiteSettings(state),
    mode: getMode(state),
    combat
  }
}

const actions = { setDice, openModal }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D {}

export default connect(mapStateToProps, actions)(TableSideInfo)
