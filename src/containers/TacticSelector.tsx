import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image } from 'semantic-ui-react'

import { AppState } from '../store/'
import { getCurrentCombat, getSelectedTactic } from '../store/utils'
import { Side } from '../store/battle'

import { getImage } from '../base_definition'

import StyledNumber from '../components/Utils/StyledNumber'
import { toSignedPercent } from '../formatters'
import ModalTacticSelector from './modal/ModalTacticSelector'

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
    const { side, bonus, tactic } = this.props
    const { modal_open } = this.state
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
  bonus: getCurrentCombat(state, props.side).tactic_bonus,
  tactic: getSelectedTactic(state, props.side)
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(TacticSelector)
