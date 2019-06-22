import React, { Component } from 'react'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTactic } from '../store/land_battle'
import { calculateTactic } from '../store/battle'
import ItemSelector from '../components/ItemSelector'
import { TacticType } from '../store/tactics'
import { ArmyName } from '../store/units'
import { toRelativePercent, toPercent } from '../base_definition'

export interface ModalInfo {
  name: ArmyName
  counter?: TacticType
}

class ModalTacticSelector extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    const army = this.props.armies.get(this.props.info.name)
    const frontline = army && army.frontline
    let custom_values = Map<string, Map<TacticType, string>>()
    custom_values = custom_values.set('effect', this.props.tactics.map(value => {
      return toPercent(calculateTactic(frontline, value), 100, true, false)
    }))
    custom_values = custom_values.set('damage', this.props.tactics.map(value => {
      return toRelativePercent(calculateTactic(frontline, value, this.props.info!.counter), true)
    }))
    return (
    <Modal basic onClose={this.props.onClose} open>
      <Modal.Content>
        <ItemSelector
          onClose={this.props.onClose}
          onSelection={this.selectTactic}
          items={this.props.tactics.toList()}
          attributes={[]}
          custom_values={custom_values}
        />
      </Modal.Content>
    </Modal>
    )
  }

  selectTactic = (type: TacticType | undefined): void => (
    this.props.info && type && this.props.selectTactic(this.props.info.name, type)
  )
}

const mapStateToProps = (state: AppState) => ({
  tactics: state.tactics.definitions,
  armies: state.land.armies
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTactic: (name: ArmyName, type: TacticType) => dispatch(selectTactic(name, type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticSelector)
