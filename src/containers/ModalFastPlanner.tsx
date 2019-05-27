import React, { Component } from 'react'
import { List, Map } from 'immutable'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import FastPlanner from '../components/FastPlanner'
import { ArmyName, UnitType, UnitDefinition } from '../store/units'

class ModalFastPlanner extends Component<IProps> {
  readonly units = Object.keys(UnitType).map(k => UnitType[k as any]).sort() as UnitType[]

  render() {
    if (!this.props.open)
      return null
    return (
      <Modal basic onClose={this.props.onClose} open centered={false}>
        <Modal.Content>
          <FastPlanner
            reserve_a={this.units.reduce((map, value) => map.set(value, this.countUnits(this.props.reserve_a, value)), Map<UnitType, number>())}
            reserve_b={this.units.reduce((map, value) => map.set(value, this.countUnits(this.props.reserve_b, value)), Map<UnitType, number>())}
            onValueChange={this.onValueChange}
          />
        </Modal.Content>
      </Modal>
    )
  }

  onValueChange = (name: ArmyName, unit: UnitType, value: number) => {

  }

  countUnits = (reserve: List<List<UnitDefinition | null>>, unit: UnitType) => {
    return reserve.reduce((previous, current) => (
      previous + current.reduce((previous, current) => previous + (current && current.type === unit ? 1 : 0), 0)
    ), 0)
  }

}

const mapStateToProps = (state: AppState) => ({
  reserve_a: state.land.attacker.reserve,
  reserve_b: state.land.defender.reserve
})

const mapDispatchToProps = (dispatch: any) => ({
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  open: boolean
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalFastPlanner)
