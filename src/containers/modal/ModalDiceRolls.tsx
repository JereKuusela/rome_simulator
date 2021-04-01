import React from 'react'
import { useDispatch } from 'react-redux'
import { ModalType, SideType } from 'types'
import { setPhaseDice, toggleRandomDice, setSeed } from 'reducers'
import { Table, Grid, Checkbox, Input, Header, InputOnChangeData } from 'semantic-ui-react'
import BaseModal, { useModalData } from './BaseModal'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { mapRange } from 'utils'
import { useBattle, useSide } from 'selectors'

const RenderIsRollRandom = ({ sideType }: { sideType: SideType }) => {
  const dispatch = useDispatch()
  const side = useSide(sideType)

  const handleClick = () => {
    dispatch(toggleRandomDice(sideType))
  }

  return <Checkbox label={'Randomize rolls'} toggle checked={side.randomizeDice} onClick={handleClick} />
}

const RenderSeed = () => {
  const dispatch = useDispatch()
  const seed = useBattle().seed
  const handleOnChange = (_: unknown, { value }: InputOnChangeData): void => {
    if (!isNaN(Number(value))) dispatch(setSeed(Number(value)))
  }
  return <Input type='number' value={seed} label='Seed for random generator' onChange={handleOnChange} />
}

const RenderPhase = ({ sideType, phase, roll }: { sideType: SideType; phase: number; roll: number }) => {
  const dispatch = useDispatch()
  const handleOnChange = (value: number) => {
    dispatch(setPhaseDice(sideType, phase, value))
  }
  return (
    <Table.Cell key={phase}>
      Phase {phase + 1}
      <span style={{ paddingLeft: '1em' }}>
        <DelayedNumericInput delay={0} value={roll} onChange={handleOnChange} />
      </span>
    </Table.Cell>
  )
}

const RenderCustomRolls = ({ sideType }: { sideType: SideType }) => {
  const side = useSide(sideType)
  const rolls = side.rolls.concat(0)
  const rows = Math.ceil((rolls.length - 1) / 4)
  return (
    <Table celled fixed>
      <Table.Body>
        {mapRange(rows, row => (
          <Table.Row key={row}>
            {mapRange(4, column => {
              const phase = row * 4 + column
              if (phase >= rolls.length) return <Table.Cell key={phase}></Table.Cell>
              return <RenderPhase key={phase} phase={phase} sideType={sideType} roll={rolls[phase]} />
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

const ModalDiceRolls = (): JSX.Element | null => {
  const data = useModalData(ModalType.DiceRolls)
  if (!data) return null

  return (
    <BaseModal type={ModalType.DiceRolls}>
      <Grid>
        <Grid.Row columns='2'>
          <Grid.Column>
            <RenderIsRollRandom sideType={data.side} />
          </Grid.Column>
          <Grid.Column>
            <RenderSeed />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Header>Custom rolls (overrides randomization)</Header>
          <RenderCustomRolls sideType={data.side} />
        </Grid.Row>
      </Grid>
    </BaseModal>
  )
}

export default ModalDiceRolls
