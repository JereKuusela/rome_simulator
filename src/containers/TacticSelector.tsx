import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState, getCurrentCombat, getSelectedTactic, filterTactics, getSiteSettings, getParticipant } from 'state'
import { toArr } from 'utils'
import { selectTactic } from 'reducers'
import { SideType, CombatCohorts, TacticDefinition, TacticCalc, TacticType, Tactic } from 'types'
import { calculateTactic } from 'combat'
import { getOpponent } from 'army_utils'
import { calculateValue } from 'definition_values'
import DropdownTactic from 'components/Dropdowns/DropdownTactic'

type Props = {
  side: SideType
}

class TacticSelector extends Component<IProps> {
  render() {
    const { tactic, tactics, settings } = this.props
    return (
      <DropdownTactic values={tactics} value={tactic} onSelect={this.selectTactic} settings={settings} />
    )
  }

  selectTactic = (type: TacticType) => {
    const { participant, selectTactic } = this.props
    selectTactic(participant.country, participant.army, type)
  }
}


const convertTactic = (tactic: TacticDefinition, cohorts: CombatCohorts, opposingTactic: TacticDefinition): Tactic => {
  return {
    type: tactic.type,
    effect: calculateTactic(cohorts, tactic),
    damage: calculateTactic(cohorts, tactic, opposingTactic),
    casualties: calculateValue(tactic, TacticCalc.Casualties),
    image: tactic.image
  }
}

const mapStateToProps = (state: AppState, props: Props) => {
  const cohorts = getCurrentCombat(state, props.side)
  const tactic = getSelectedTactic(state, props.side)
  const opposingTactic = getSelectedTactic(state, getOpponent(props.side))
  return {
    tactics: toArr(filterTactics(state), tactic => convertTactic(tactic, cohorts, opposingTactic)),
    tactic: tactic.type,
    participant: getParticipant(state, props.side),
    settings: getSiteSettings(state)
  }
}

const actions = { selectTactic }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(TacticSelector)
