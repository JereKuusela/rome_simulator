import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image } from 'semantic-ui-react'

import { AppState, getCurrentCombat, getSelectedTactic } from 'state'

import { getImage } from '../base_definition'

import StyledNumber from '../components/Utils/StyledNumber'
import ModalTacticSelector from './modal/ModalTacticSelector'
import { Side, getOpponent } from 'types'
import { calculateTactic } from 'combat/combat'
import { toSignedPercent } from 'formatters'

type Props = {
  side: Side
}

type IState = {
  modal_open: boolean
}

// Shows a tactic for a side.
class TacticSelector extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { modal_open: false }
  }

  render() {
    const { side, opposing_tactic, tactic, units } = this.props
    const { modal_open } = this.state
    const bonus = calculateTactic(units, tactic, opposing_tactic)
    return (
      <>
        <ModalTacticSelector
          side={modal_open ? side : undefined}
          onClose={this.closeModal}
        />
        <div key={side} onClick={() => this.setState({modal_open: true})}>
          {<Image src={getImage(tactic)} avatar />}
          {(tactic && tactic.type) || 'None'}
          {' ('}
          <StyledNumber
            value={bonus}
            formatter={toSignedPercent}
          />
          {')'}
        </div >
      </>
    )
  }

  closeModal = () => {
    this.setState({modal_open: false})
  }
}


const mapStateToProps = (state: AppState, props: Props) => ({
  units: getCurrentCombat(state, props.side),
  tactic: getSelectedTactic(state, props.side),
  opposing_tactic: getSelectedTactic(state, getOpponent(props.side)),
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(TacticSelector)
