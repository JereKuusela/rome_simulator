import React, { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Button, Grid, Header, Checkbox, CheckboxProps } from 'semantic-ui-react'
import { getCombatPhase } from 'combat'
import PreferredUnitTypes from 'containers/PreferredUnitTypes'
import TableStats from 'containers/TableStats'
import TableArmyPart from 'containers/GridRowArmyPart'
import TargetArrows from 'containers/TargetArrows'
import TerrainSelector from 'containers/TerrainSelector'
import WinRate from 'containers/WinRate'
import { clearCohorts, changeSiteParameter, refreshBattle, resetState, openModal, battle, undo } from 'reducers'
import { useParticipant, useSiteSettings, useBattle, useCombatWidth, useTimestamp } from 'state'
import { ArmyPart, CountryName, Setting, SideType, CombatPhase, UnitType, ModalType, ArmyName } from 'types'
import TableUnitTypes from 'containers/TableUnitTypes'
import TableArmyInfo from 'containers/TableArmyInfo'
import TableSideInfo from 'containers/TableSideInfo'
import TableDamageAttributes from 'containers/TableDamageAttributes'
import AccordionToggle from 'containers/AccordionToggle'
import { getDay, getRound } from 'managers/battle'
import ParticipantSelector from 'containers/ParticipantSelector'

const ATTACKER_COLOR = '#FFAA00AA'
const DEFENDER_COLOR = '#00AAFFAA'

const Battle = (): JSX.Element | null => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(refreshBattle())
  }, [dispatch])

  const timestamp = useTimestamp()
  if (!timestamp) return null
  return (
    <>
      <Refresher />
      <Frontline />
      <br />
      <br />
      <BattleSetup />
      <br />
      <Stats />
      <br />
      <ReserveAndDefeated />
      <br />
      <Controls />
    </>
  )
}

const Refresher = () => {
  const dispatch = useDispatch()
  const settings = useSiteSettings()
  const battle = useBattle()
  const round = getRound(battle)
  const autoRefresh = settings[Setting.AutoRefresh]

  useEffect(() => {
    if (battle.outdated && (autoRefresh || round < 0)) dispatch(refreshBattle())
  }, [battle.outdated, round, dispatch, autoRefresh])

  return null
}

const getRoundName = (day: number, round: number, fightOver: boolean, phase: CombatPhase): string => {
  const dayStr = day === round ? '' : ', Day ' + day
  let roundStr = ''
  if (fightOver) roundStr = 'Fight over'
  else if (day === 0 || round === 0) roundStr = 'Deployment'
  else if (round === -1) roundStr = 'Waiting for enemies'
  else if (phase !== CombatPhase.Default) roundStr = 'Round ' + String(round) + ' (' + phase + ')'
  else roundStr = 'Round ' + String(round)
  return roundStr + dayStr
}

const useOpenCohortModal = () => {
  const dispatch = useDispatch()
  return useCallback(
    (side: SideType, participantIndex: number, index: number, country: CountryName, army: ArmyName): void => {
      dispatch(openModal(ModalType.CohortDetail, { side, country, army, index, participantIndex }))
    },
    [dispatch]
  )
}

const RenderFrontline = ({ sideType }: { sideType: SideType }) => {
  const combatWidth = useCombatWidth()
  const handleOpenCohortModal = useOpenCohortModal()
  return (
    <TableArmyPart
      color={sideType === SideType.A ? ATTACKER_COLOR : DEFENDER_COLOR}
      side={sideType}
      onClick={handleOpenCohortModal}
      rowWidth={Math.max(30, combatWidth)}
      reverse={sideType === SideType.A}
      part={ArmyPart.Frontline}
      markDefeated
    />
  )
}

const Frontline = () => {
  const dispatch = useDispatch()
  const settings = useSiteSettings()
  const battleState = useBattle()
  const { outdated, fightOver } = battleState
  const day = getDay(battleState)
  const round = getRound(battleState)
  const isUndoAvailable = day > 0
  const doUndo = useCallback(
    (rounds: number) => {
      dispatch(undo(rounds))
      if (outdated) dispatch(refreshBattle())
    },
    [dispatch, outdated]
  )
  const doBattle = useCallback(
    (rounds: number) => {
      if (outdated) dispatch(refreshBattle())
      dispatch(battle(rounds))
    },
    [dispatch, outdated]
  )
  const handleUndoTen = useCallback(() => doUndo(10), [doUndo])
  const handleUndo = useCallback(() => doUndo(1), [doUndo])
  const handleRedoTen = useCallback(() => doBattle(10), [doBattle])
  const handleRedo = useCallback(() => doBattle(1), [doBattle])
  const handleChangeAutoRefresh = useCallback(
    (_, { checked }: CheckboxProps) => {
      dispatch(changeSiteParameter(Setting.AutoRefresh, !!checked))
    },
    [dispatch]
  )

  return (
    <Grid verticalAlign='middle'>
      <Grid.Row>
        <Grid.Column floated='left' width='3'>
          <Header>{getRoundName(day, round, fightOver, getCombatPhase(round, settings))}</Header>
        </Grid.Column>
        <Grid.Column textAlign='center' width='3'>
          <Checkbox
            label={Setting.AutoRefresh}
            checked={settings[Setting.AutoRefresh]}
            onChange={handleChangeAutoRefresh}
          />
        </Grid.Column>
        <Grid.Column width='6'>
          <WinRate />
        </Grid.Column>
        <Grid.Column floated='right' textAlign='right' width='4'>
          <Button
            circular
            icon='angle double left'
            color='black'
            size='huge'
            disabled={!isUndoAvailable}
            onClick={handleUndoTen}
          />
          <Button
            circular
            icon='angle left'
            color='black'
            size='huge'
            disabled={!isUndoAvailable}
            onClick={handleUndo}
          />
          <Button circular icon='angle right' color='black' size='huge' disabled={fightOver} onClick={handleRedo} />
          <Button
            circular
            icon='angle double right'
            color='black'
            size='huge'
            disabled={fightOver}
            onClick={handleRedoTen}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={1}>
        <Grid.Column>
          <RenderFrontline sideType={SideType.A} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={1} style={{ padding: 0 }}>
        <Grid.Column>
          <TargetArrows
            type={ArmyPart.Frontline}
            visible={!fightOver}
            attackerColor={ATTACKER_COLOR}
            defenderColor={DEFENDER_COLOR}
          />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={1}>
        <Grid.Column>
          <RenderFrontline sideType={SideType.B} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <TableSideInfo sideType={SideType.A} />
        </Grid.Column>
        <Grid.Column>
          <TableSideInfo sideType={SideType.B} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

const BattleSetup = () => {
  const participantA = useParticipant(SideType.A)
  const participantB = useParticipant(SideType.B)
  const settings = useSiteSettings()
  const dispatch = useDispatch()

  const handleRowCLick = useCallback(
    (countryName: CountryName, armyName: ArmyName, type: UnitType): void => {
      dispatch(openModal(ModalType.UnitDetail, { country: countryName, army: armyName, type }))
    },
    [dispatch]
  )

  return (
    <AccordionToggle title='Setup' identifier='BattleSetup' open>
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column>
            <TableArmyInfo type={SideType.A} />
          </Grid.Column>
          <Grid.Column>
            <TableArmyInfo type={SideType.B} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column>
            <ParticipantSelector side={SideType.A} />
            <TableUnitTypes
              side={SideType.A}
              countryName={participantA.countryName}
              armyName={participantA.armyName}
              onRowClick={handleRowCLick}
            />
          </Grid.Column>
          <Grid.Column>
            <ParticipantSelector side={SideType.B} />
            <TableUnitTypes
              side={SideType.B}
              countryName={participantB.countryName}
              armyName={participantB.armyName}
              onRowClick={handleRowCLick}
            />
          </Grid.Column>
        </Grid.Row>
        {settings[Setting.FireAndShock] && (
          <Grid.Row columns={2}>
            <Grid.Column>
              <TableDamageAttributes
                side={SideType.A}
                countryName={participantA.countryName}
                armyName={participantA.armyName}
              />
            </Grid.Column>
            <Grid.Column>
              <TableDamageAttributes
                side={SideType.B}
                countryName={participantB.countryName}
                armyName={participantB.armyName}
              />
            </Grid.Column>
          </Grid.Row>
        )}
        <Grid.Row columns={1}>
          <Grid.Column>
            <TerrainSelector />
          </Grid.Column>
        </Grid.Row>
        {settings[Setting.CustomDeployment] && (
          <Grid.Row columns={1}>
            <Grid.Column>
              <PreferredUnitTypes />
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
      <br />
    </AccordionToggle>
  )
}

const Stats = () => {
  return (
    <AccordionToggle title='Stats' identifier='BattleStats' open>
      <Grid>
        <Grid.Row columns={1}>
          <Grid.Column>
            <TableStats />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <br />
      <br />
    </AccordionToggle>
  )
}

const RenderReserve = ({ sideType }: { sideType: SideType }) => {
  const handleOpenCohortModal = useOpenCohortModal()
  return (
    <TableArmyPart
      color={sideType === SideType.A ? ATTACKER_COLOR : DEFENDER_COLOR}
      side={sideType}
      onClick={handleOpenCohortModal}
      rowWidth={30}
      reverse={false}
      part={ArmyPart.Reserve}
      fullRows
    />
  )
}

const RenderDefeated = ({ sideType }: { sideType: SideType }) => {
  const handleOpenCohortModal = useOpenCohortModal()
  return (
    <TableArmyPart
      color={sideType === SideType.A ? ATTACKER_COLOR : DEFENDER_COLOR}
      side={sideType}
      onClick={handleOpenCohortModal}
      rowWidth={30}
      reverse={false}
      part={ArmyPart.Defeated}
      fullRows
    />
  )
}
const RenderRetreated = ({ sideType }: { sideType: SideType }) => {
  const handleOpenCohortModal = useOpenCohortModal()
  return (
    <TableArmyPart
      color={sideType === SideType.A ? ATTACKER_COLOR : DEFENDER_COLOR}
      side={sideType}
      onClick={handleOpenCohortModal}
      rowWidth={30}
      reverse={false}
      part={ArmyPart.Retreated}
      fullRows
      hideIfEmpty
    />
  )
}

const ReserveAndDefeated = () => {
  return (
    <AccordionToggle title='Reserve & Defeated' identifier='Reserve'>
      <Grid>
        <RenderReserve sideType={SideType.A} />
        <RenderReserve sideType={SideType.B} />
        <RenderDefeated sideType={SideType.A} />
        <RenderDefeated sideType={SideType.B} />
        <RenderRetreated sideType={SideType.A} />
        <RenderRetreated sideType={SideType.B} />
      </Grid>
      <br />
      <br />
    </AccordionToggle>
  )
}

const Controls = () => {
  const dispatch = useDispatch()
  const participantA = useParticipant(SideType.A)
  const participantB = useParticipant(SideType.B)
  const handleResetUnits = useCallback(() => {
    dispatch(clearCohorts(participantA.countryName, participantA.armyName))
    dispatch(clearCohorts(participantB.countryName, participantB.armyName))
  }, [dispatch, participantA.countryName, participantA.armyName, participantB.countryName, participantB.armyName])

  const handleResetData = useCallback(() => dispatch(resetState()), [dispatch])
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column floated='right' width='6' textAlign='right'>
          <Button negative onClick={handleResetUnits}>
            Reset units
          </Button>
          <Button negative onClick={handleResetData}>
            Reset all data
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default Battle
