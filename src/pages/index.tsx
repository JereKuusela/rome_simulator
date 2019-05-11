import React, { Component } from 'react'
import { connect } from 'react-redux'
import { AppState} from './../store/index'
import { UnitType, UnitDefinition } from '../store/units/types'

interface IndexProps {
  attacker: Map<UnitType, UnitDefinition>
}

class Index extends Component<IndexProps> {

  render() {
    return (
      <h1>{this.props.attacker.toString()}</h1>
    )
  }
}

const mapStateToProps = (state: AppState): IndexProps => ({
  attacker: state.units.attacker
})

const mapDispatchToProps = (dispatch: any) => ({

})



export default connect(mapStateToProps, mapDispatchToProps)(Index)