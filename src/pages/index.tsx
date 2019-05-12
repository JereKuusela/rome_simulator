import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { AppState } from './../store/index'
import { UnitType, UnitDefinition } from '../store/units/types'

interface IndexProps {
  attacker: Map<UnitType, UnitDefinition>
}

class Index extends Component<IndexProps> {

  render() {
    return (
      <Table>
        <Table.Body>
          {
            Array.from(this.props.attacker).map((value) => {return (
              <Table.Row>
                <Table.Cell>{value[0].toString()}</Table.Cell>
                <Table.Cell>{value[1].manpower}</Table.Cell>
              </Table.Row>
            )})
          }
        </Table.Body>
      </Table>
    )
  }
}

const mapStateToProps = (state: AppState): IndexProps => ({
  attacker: state.units.attacker
})

const mapDispatchToProps = (dispatch: any) => ({

})



export default connect(mapStateToProps, mapDispatchToProps)(Index)