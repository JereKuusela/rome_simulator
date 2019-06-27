import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { UnitType, ArmyName, ArmyType, ValueType, Unit, UnitDefinition } from '../store/units'
import { selectUnit } from '../store/battle'
import { AppState } from '../store/'
import { getBattle, filterTerrainTypes } from '../utils'
import { addValues, mergeValues, ValuesType, DefinitionType } from '../base_definition'
import ItemRemover from '../components/ItemRemover'
import UnitDetail from '../components/UnitDetail'

const CUSTOM_VALUE_KEY = 'Unit'

export interface ModalInfo {
  name: ArmyName
  index: number
  type: ArmyType
}

class CountrySelector extends Component<IProps> {

  unit: Unit = undefined!

  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    return (
      <Modal basic onClose={this.props.onClose} open>
      </Modal>
    )
  }
}

const mapStateToProps = (state: AppState) => ({

})

const mapDispatchToProps = (dispatch: any) => ({

})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(CountrySelector)
