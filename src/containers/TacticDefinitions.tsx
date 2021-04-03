import React from 'react'
import { Image, Table, List, Button } from 'semantic-ui-react'

import VersusList from '../components/VersusList'
import StyledNumber from '../components/Utils/StyledNumber'

import Headers from '../components/Utils/Headers'
import { TacticData, TacticType, TacticCalc, ModalType } from 'types'
import { calculateValue } from 'data_values'
import { openModal, createTactic } from 'reducers'
import { toSignedPercent } from 'formatters'
import { getImage, toArr } from 'utils'
import { useDispatch } from 'react-redux'
import { useTacticsData, useUnitImages, useMergedUnitTypes, useMode } from 'selectors'

const headers = ['Tactic', 'Unit effectiveness', 'Against other tactics', 'Casualties']
/**
 * Shows tactic definitions for both sides.
 */
const TacticDefinitions = () => {
  const tactics = useTacticsData()
  const mode = useMode()

  const dispatch = useDispatch()
  const handleCreate = (type: string) => {
    dispatch(createTactic(type as TacticType, mode))
  }
  const handleClick = () => {
    dispatch(
      openModal(ModalType.Value, {
        onSuccess: handleCreate,
        message: 'New tactic type',
        buttonMessage: 'Create',
        initial: ''
      })
    )
  }
  return (
    <>
      <Table celled selectable unstackable>
        <Headers values={headers} />
        <Table.Body>
          {toArr(tactics, tactic => (
            <RenderRow tactic={tactic} />
          ))}
        </Table.Body>
      </Table>
      <Button primary onClick={handleClick}>
        Create new
      </Button>
    </>
  )
}

const RenderRow = ({ tactic }: { tactic: TacticData }) => {
  const images = useUnitImages()
  const unitTypes = useMergedUnitTypes()

  const dispatch = useDispatch()
  const handleClick = () => {
    dispatch(openModal(ModalType.TacticDetail, { type: tactic.type }))
  }
  return (
    <Table.Row key={tactic.type} onClick={handleClick}>
      <Table.Cell>
        <Image src={getImage(tactic)} avatar />
        {tactic.type}
      </Table.Cell>
      <Table.Cell>
        <VersusList item={tactic} images={images} unitTypes={unitTypes} />
      </Table.Cell>
      <Table.Cell singleLine>
        <RenderVersus tactic={tactic} />
      </Table.Cell>
      <Table.Cell>
        <StyledNumber
          value={calculateValue(tactic, TacticCalc.Casualties)}
          formatter={toSignedPercent}
          hideZero
          reverse
        />
      </Table.Cell>
    </Table.Row>
  )
}

const RenderVersus = ({ tactic }: { tactic: TacticData }) => {
  const tactics = toArr(useTacticsData())
  const filtered = tactics.filter(versus => calculateValue(tactic, versus.type))
  return (
    <List horizontal>
      {filtered.map(versus => (
        <List.Item key={versus.type} style={{ marginLeft: 0, marginRight: '1em' }}>
          <Image src={getImage(versus)} avatar />
          <StyledNumber value={calculateValue(tactic, versus.type)} formatter={toSignedPercent} />
        </List.Item>
      ))}
    </List>
  )
}

export default TacticDefinitions
