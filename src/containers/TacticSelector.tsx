import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState, getCohorts, getSelectedTactic, getTactics, getSiteSettings, getParticipant, getCombatSide } from 'state'
import { selectTactic } from 'reducers'
import { SideType, Cohorts, TacticDefinition, TacticCalc, TacticType, Tactic } from 'types'
import { calculateTactic } from 'combat'
import { getOpponent } from 'army_utils'
import { calculateValue } from 'definition_values'
import DropdownTactic from 'components/Dropdowns/DropdownTactic'
import { getLeadingArmy } from 'managers/battle'

type Props = {
  side: SideType
  index: number
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
    selectTactic(participant.countryName, participant.armyName, type)
  }
}


const convertTactic = (tactic: TacticDefinition, cohorts: Cohorts, opposingTactic: TacticDefinition): Tactic => {
  return {
    type: tactic.type,
    effect: calculateTactic(cohorts, tactic),
    damage: calculateTactic(cohorts, tactic, opposingTactic),
    casualties: calculateValue(tactic, TacticCalc.Casualties),
    image: tactic.image
  }
}

const mapStateToProps = (state: AppState, props: Props) => {
  const cohorts = getCohorts(state, props.side)
  const tactic = getSelectedTactic(state, props.side, props.index)
  const opponent = getLeadingArmy(getCombatSide(state, getOpponent(props.side)))
  return {
    tactics: opponent ? getTactics(state).map(tactic => convertTactic(tactic, cohorts, opponent.tactic)) : [],
    tactic: tactic.type,
    participant: getParticipant(state, props.side, props.index),
    settings: getSiteSettings(state)
  }
}

const actions = { selectTactic }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(TacticSelector)
