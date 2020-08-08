import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Grid } from 'semantic-ui-react'

import { UnitAttribute, Cohort } from 'types'
import { AppState, getCohorts, getBattle } from 'state'
import { getArmyPart } from 'army_utils'
import { deleteCohort } from 'reducers'
import { flatten } from 'lodash'
import TableArmyPart, { ICohort, SharedProps } from 'components/TableArmyPart'

type Props = SharedProps & {
  hideIfEmpty?: boolean
}

/**
 * Handles data mapping for TableArmyPart, splitting the complex component.
 * Also supports hiding the table and parent grid row if no cohorts.
 */
class GridRowArmyPart extends Component<IProps> {

  render() {
    const { timestamp, hideIfEmpty, cohorts } = this.props
    if (hideIfEmpty && !flatten(cohorts).length)
      return null
    return (
      <Grid.Row columns={1}>
        <Grid.Column>
          <TableArmyPart
            {...this.props}
            timestamp={timestamp}
            onDeleteCohort={this.deleteCohort}
          />
        </Grid.Column>
      </Grid.Row>
    )
  }

  deleteCohort = (cohort: ICohort) => {
    if (!cohort)
      return
    const { deleteCohort } = this.props
    deleteCohort(cohort.countryName, cohort.armyName, cohort.index)
  }
}

const convertCohorts = (cohorts: (Cohort | null)[][]): ICohort[][] => (
  cohorts.map(row => row.map(cohort => cohort && {
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
  }))
)

const mapStateToProps = (state: AppState, props: Props) => ({
  cohorts: convertCohorts(getArmyPart(getCohorts(state, props.side), props.part)),
  timestamp: getBattle(state).timestamp
})

const actions = { deleteCohort }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(GridRowArmyPart)
