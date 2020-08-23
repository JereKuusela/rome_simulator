import React, { Component } from 'react'
import { connect } from 'react-redux'

import { AppState, getSide } from 'state'
import { selectParticipant } from 'reducers'
import { SideType } from 'types'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { getParticipantName } from 'managers/battle'

type Props = {
  side: SideType
}

/**
 * Selector for battle participant.
 */
class ParticipantSelector extends Component<IProps> {

  render() {
    const { value, values, selectParticipant, side } = this.props
    return (
      <span>
        <span>Edit army: </span>
        <SimpleDropdown
          value={value}
          values={values}
          onChange={(value) => selectParticipant(side, value)}
        />

      </span>
    )
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  value: state.ui.selectedParticipantIndex[props.side],
  values: getSide(state, props.side).participants.map((item, index) => ({ value: index, text: getParticipantName(item) }))
})

const actions = { selectParticipant }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }
export default connect(mapStateToProps, actions)(ParticipantSelector)
