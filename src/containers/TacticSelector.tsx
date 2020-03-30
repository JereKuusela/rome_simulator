import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState, getCurrentCombat, getSelectedTactic, filterTactics, getCountryName } from 'state'
import { toArr } from 'utils'
import { selectTactic, invalidate } from 'reducers'
import { Side, CombatCohorts, TacticDefinition, TacticCalc, TacticType, Tactic } from 'types'
import { calculateTactic } from 'combat'
import { getOpponent } from 'army_utils'
import { calculateValue } from 'definition_values'
import DropdownTactic from 'components/Dropdowns/DropdownTactic'

type Props = {
  side: Side
}

class TacticSelector extends Component<IProps> {
  render() {
    const { tactic, tactics } = this.props
    return (
      <DropdownTactic values={tactics} value={tactic} onSelect={this.selectTactic} />
    )
  }

  selectTactic = (type: TacticType) => {
    const { country, selectTactic, invalidate } = this.props
    selectTactic(country, type)
    invalidate()
  }
}


const convertTactic = (tactic: TacticDefinition, cohorts: CombatCohorts, opposing_tactic: TacticDefinition): Tactic => {
  return {
    type: tactic.type,
    effect: calculateTactic(cohorts, tactic),
    damage: calculateTactic(cohorts, tactic, opposing_tactic),
    casualties: calculateValue(tactic, TacticCalc.Casualties),
    image: tactic.image
  }
}

const mapStateToProps = (state: AppState, props: Props) => {
  const cohorts = getCurrentCombat(state, props.side)
  const tactic = getSelectedTactic(state, props.side)
  const opposing_tactic = getSelectedTactic(state, getOpponent(props.side))
  return {
    tactics: toArr(filterTactics(state), tactic => convertTactic(tactic, cohorts, opposing_tactic)),
    tactic: tactic.type,
    country: getCountryName(state, props.side)
  }
}

const actions = { selectTactic, invalidate }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(TacticSelector)
