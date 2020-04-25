import React, { Component } from 'react'
import ModalDiceRolls from 'containers/modal/ModalDiceRolls'
import ModalCohortSelector from 'containers/modal/ModalCohortSelector'
import ModalCohortDetail from 'containers/modal/ModalCohortDetail'
import ModalUnitDetail from 'containers/modal/ModalUnitDetail'
import ModalTerrainDetail from 'containers/modal/ModalTerrainDetail'
import ModalTacticDetail from 'containers/modal/ModalTacticDetail'
import ModalValue from 'containers/modal/ModalValue'

/**
 * Global component for modals.
 */
export default class Modals extends Component {
  render() {
    return (
      <>
        <ModalDiceRolls />
        <ModalCohortSelector />
        <ModalCohortDetail />
        <ModalUnitDetail />
        <ModalTerrainDetail />
        <ModalTacticDetail />
        <ModalValue />
      </>
    )
  }
}
