import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'

import { AppState } from '../../store/'
import { selectTactic, invalidate, Side, getOpponent } from '../../store/battle'
import { TacticType, TacticCalc } from '../../store/tactics'
import { filterTactics, getCurrentCombat, getSelectedTactic, getCountry } from '../../store/utils'

import { calculateValue } from '../../base_definition'
import { toSignedPercent, toPercent } from '../../formatters'
import { map, filter, toArr } from '../../utils'
import { calculateTactic } from '../../combat/combat'

import StyledNumber from '../../components/Utils/StyledNumber'
import ItemSelector, { SelectorAttributes } from '../../components/ItemSelector'

type Props = {
  side?: Side
  onClose: () => void
}

class ModalTacticSelector extends Component<IProps> {
  render() {
    const { side, units, opposing_tactic } = this.props
    if (!side || !units)
      return null
    const attributes = {} as SelectorAttributes<TacticType>
    attributes['effect'] =  map(this.props.tactics, value => (
        <StyledNumber
         value={calculateTactic(units, value)}
         formatter={toPercent}
        /> 
    ))
    attributes['damage'] = map(this.props.tactics, value => (
       <StyledNumber
        value={calculateTactic(units, value, opposing_tactic)}
        formatter={toSignedPercent}
       /> 
    ))
    attributes['casualties'] = map(filter(this.props.tactics, value => calculateValue(value, TacticCalc.Casualties)),value => (
      <StyledNumber
        value={calculateValue(value, TacticCalc.Casualties)}
        formatter={toSignedPercent}
        reverse
       /> 
    ))
    return (
    <Modal basic onClose={this.props.onClose} open>
      <Modal.Content>
        <ItemSelector
          onSelection={this.selectTactic}
          items={toArr(this.props.tactics)}
          attributes={attributes}
        />
      </Modal.Content>
    </Modal>
    )
  }

  selectTactic = (type: TacticType | null) => {
    const { mode, country, selectTactic, onClose, invalidate } = this.props
    if (country && type)
      selectTactic(mode, country, type)
    invalidate(mode)
    onClose()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  units: props.side && getCurrentCombat(state, props.side),
  tactics: filterTactics(state),
  opposing_tactic: props.side && getSelectedTactic(state, getOpponent(props.side)),
  country: props.side && getCountry(state, props.side),
  mode: state.settings.mode
})

const actions = { selectTactic, invalidate}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
type IProps = Props & S & D

export default connect(mapStateToProps, actions)(ModalTacticSelector)
