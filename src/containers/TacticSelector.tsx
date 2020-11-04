import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState, getSelectedTactic, getSiteSettings, getParticipant, getTactics } from 'state'
import { selectTactic } from 'reducers'
import { SideType, TacticType } from 'types'
import DropdownTactic from 'components/Dropdowns/DropdownTactic'

type Props = {
  side: SideType
  index: number
}

class TacticSelector extends Component<IProps> {
  render() {
    const { tactic, tactics, settings } = this.props
    return <DropdownTactic values={tactics} value={tactic} onSelect={this.selectTactic} settings={settings} />
  }

  selectTactic = (type: TacticType) => {
    const { participant, selectTactic } = this.props
    selectTactic(participant.countryName, participant.armyName, type)
  }
}

const mapStateToProps = (state: AppState, props: Props) => {
  const tactic = getSelectedTactic(state, props.side, props.index)
  return {
    tactics: getTactics(state, props.side),
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
