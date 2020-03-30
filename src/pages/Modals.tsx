import React, { Component } from 'react'
import ModalDiceRolls from 'containers/modal/ModalDiceRolls'
import ModalCohortSelector from 'containers/modal/ModalCohortSelector'
import ModalCohortDetail from 'containers/modal/ModalCohortDetail'
import ModalUnitDetail from 'containers/modal/ModalUnitDetail'

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
      </>
    )
  }
}
