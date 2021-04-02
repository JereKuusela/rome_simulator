import React, { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { Grid } from 'semantic-ui-react'

import { UnitAttribute, Cohort } from 'types'
import { getArmyPart } from 'army_utils'
import { deleteCohort } from 'reducers'
import { flatten } from 'lodash'
import TableArmyPart, { ICohort, SharedProps } from 'components/TableArmyPart'
import { useCohorts, useTimestamp } from 'selectors'

type Props = SharedProps & {
  hideIfEmpty?: boolean
}

/**
 * Handles data mapping for TableArmyPart, splitting the complex component.
 * Also supports hiding the table and parent grid row if no cohorts.
 */
const GridRowArmyPart = (props: Props): JSX.Element | null => {
  const dispatch = useDispatch()
  const { hideIfEmpty, part, side } = props
  const handleDeleteCohort = useCallback(
    (cohort: ICohort) => {
      if (!cohort) return
      dispatch(deleteCohort(cohort.countryName, cohort.armyName, cohort.index))
    },
    [dispatch]
  )

  const rawCohorts = useCohorts(side)
  const timestamp = useTimestamp()
  const cohorts = useMemo(() => {
    return convertCohorts(getArmyPart(rawCohorts, part))
  }, [rawCohorts, part])

  if (hideIfEmpty && !flatten(cohorts).length) return null
  return (
    <Grid.Row columns={1}>
      <Grid.Column>
        <TableArmyPart {...props} cohorts={cohorts} timestamp={timestamp} onDeleteCohort={handleDeleteCohort} />
      </Grid.Column>
    </Grid.Row>
  )
}

const convertCohorts = (cohorts: (Cohort | null)[][]): ICohort[][] =>
  cohorts.map(row =>
    row.map(
      cohort =>
        cohort && {
          index: cohort.properties.index,
          participantIndex: cohort.properties.participantIndex,
          armyName: cohort.properties.armyName,
          countryName: cohort.properties.countryName,
          isDefeated: cohort.state.isDefeated,
          image: cohort.properties.image,
          morale: cohort[UnitAttribute.Morale],
          maxMorale: cohort.properties.maxMorale,
          strength: cohort[UnitAttribute.Strength],
          maxStrength: cohort.properties.maxStrength
        }
    )
  )

export default GridRowArmyPart
