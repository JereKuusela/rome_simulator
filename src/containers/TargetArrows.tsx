import React, { memo, useMemo } from 'react'
import LineTo from 'react-lineto'

import { ArmyPart, SideType, Cohort } from 'types'
import { getArmyPart, getOpponent } from 'army_utils'
import { getCohortId } from 'managers/units'
import { useCohorts } from 'selectors'

type Props = {
  armyPart: ArmyPart
  visible: boolean
  attackerColor: string
  defenderColor: string
}

const useData = (sideType: SideType, armyPart: ArmyPart) => {
  const cohorts = useCohorts(sideType)
  return useMemo(() => convertUnits(sideType, getArmyPart(cohorts, armyPart)), [sideType, armyPart, cohorts])
}

/**
 * Display component for showing attack targets for both sides.
 */
const TargetArrows = ({ armyPart, visible, attackerColor, defenderColor }: Props) => {
  const attacker = useData(SideType.A, armyPart)
  const defender = useData(SideType.B, armyPart)
  if (!visible) return null
  return (
    <>
      {attacker.map(row =>
        row.map((unit, index) => <RenderAttacker key={unit?.id ?? index} unit={unit} color={attackerColor} />)
      )}
      {defender.map(row =>
        row.map((unit, index) => <RenderDefender key={unit?.id ?? index} unit={unit} color={defenderColor} />)
      )}
    </>
  )
}

type SubProps = { unit: IUnit; color: string }

const RenderAttacker = ({ unit, color }: SubProps) => {
  if (!unit || !unit.target) return null
  const fromStr = unit.id
  const toStr = unit.target
  return <MemoizedRenderArrow from={fromStr} to={toStr} fromAnchor='bottom' toAnchor='top' borderColor={color} />
}

const RenderDefender = ({ unit, color }: SubProps) => {
  if (!unit || !unit.target) return null
  const fromStr = unit.id
  const toStr = unit.target
  return <MemoizedRenderArrow from={fromStr} to={toStr} fromAnchor='top' toAnchor='bottom' borderColor={color} />
}

type RenderArrowProps = {
  from: string
  to: string
  fromAnchor: string
  toAnchor: string
  borderColor: string
}

const RenderArrow = ({ from, to, fromAnchor, toAnchor, borderColor }: RenderArrowProps) => (
  <LineTo
    key={from + '_' + to}
    borderColor={borderColor}
    from={from}
    fromAnchor={fromAnchor}
    to={to}
    toAnchor={toAnchor}
    delay={true}
    zIndex={-1}
  />
)

const MemoizedRenderArrow = memo(RenderArrow)

type IUnit = {
  id: string
  target: string | null
} | null

const convertUnits = (side: SideType, units: (Cohort | null)[][]): IUnit[][] =>
  units.map(row =>
    row.map(cohort =>
      cohort
        ? {
            id: getCohortId(side, cohort.properties),
            target: cohort.state.target ? getCohortId(getOpponent(side), cohort.state.target.properties) : null
          }
        : null
    )
  )

const MemoizedTargetArrows = memo(TargetArrows)
export default MemoizedTargetArrows
