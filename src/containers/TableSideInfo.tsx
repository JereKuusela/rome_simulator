import React from 'react'
import { useDispatch } from 'react-redux'
import { Image, Table, Button } from 'semantic-ui-react'

import { SideType, Setting, CharacterAttribute, ModalType } from 'types'
import { setDice, openModal } from 'reducers'
import StyledNumber from 'components/Utils/StyledNumber'
import { getCombatPhase, getCombatPhaseNumber } from 'combat'
import { addSign, toSignedPercent } from 'formatters'
import IconDice from 'images/chance.png'
import IconTerrain from 'images/terrain.png'
import AttributeImage from 'components/Utils/AttributeImage'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { getImage } from 'utils'
import {
  useCombatSide,
  useLeadingArmy,
  useParticipantName,
  useRound,
  useSide,
  useCombatSettings,
  useTactics
} from 'selectors'

type Props = {
  sideType: SideType
}

const TableSideInfo = ({ sideType }: Props) => {
  const settings = useCombatSettings()
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
      <Table.Body>
        <RenderSide sideType={sideType} />
      </Table.Body>
    </Table>
  )
}

const RenderSide = ({ sideType }: Props) => {
  const settings = useCombatSettings()
  const tactics = useTactics(sideType)
  const army = useLeadingArmy(sideType)
  const tactic = tactics.find(item => item.type === army?.tactic?.type)
  const participantIndex = army?.participantIndex ?? 0
  const participant = useParticipantName(sideType, participantIndex)
  return (
    <Table.Row key={sideType}>
      <Table.Cell>{participant}</Table.Cell>
      <Table.Cell>
        <AttributeImage attribute={CharacterAttribute.Martial} />
        {army ? army.general[CharacterAttribute.Martial] : 0}
      </Table.Cell>
      {settings[Setting.Tactics] && (
        <Table.Cell collapsing>
          {army ? <Image src={getImage(army.tactic)} avatar /> : null}
          {tactic ? <StyledNumber value={tactic.damage} formatter={toSignedPercent} /> : null}
        </Table.Cell>
      )}
      <Table.Cell>
        <RenderRoll sideType={sideType} />
      </Table.Cell>
    </Table.Row>
  )
}

const RenderRoll = ({ sideType }: Props) => {
  const dispatch = useDispatch()
  const side = useSide(sideType)
  const settings = useCombatSettings()
  const round = useRound()
  const handleClick = () => {
    dispatch(openModal(ModalType.DiceRolls, { side: sideType }))
  }
  const handleChange = (value: number) => {
    dispatch(setDice(sideType, value))
  }
  const combat = useCombatSide(sideType)
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
        <DelayedNumericInput type='number' value={side.dice} onChange={handleChange} />
      )}
      <span style={{ paddingLeft: '1em' }}>
        <Button size='mini' icon={'plus'} onClick={handleClick} />
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

export default TableSideInfo
