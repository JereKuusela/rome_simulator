import React, { Component } from 'react'
import { Map, fromJS } from 'immutable'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTerrain, invalidate } from '../store/battle'
import ItemSelector from '../components/ItemSelector'
import { TerrainType, TerrainCalc, LocationType } from '../store/terrains'
import { DefinitionType, calculateValue } from '../base_definition'
import { filterTerrains } from '../store/utils'
import StyledNumber from '../components/StyledNumber'
import { addSign } from '../formatters'
import { toArr, filter, map } from '../utils'

export interface ModalInfo {
  index: number
  location?: LocationType
}

class ModalTerrainSelector extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    let attributes = Map<string, { [key in TerrainType]: JSX.Element }>()
    attributes = attributes.set('to attacker\'s roll', map(filter(this.props.terrains, value => calculateValue(value, TerrainCalc.Roll)), value => (
      <StyledNumber
        value={calculateValue(value, TerrainCalc.Roll)}
        formatter={addSign}
      />
    )))
    return (
      <Modal basic onClose={this.props.onClose} open>
        <Modal.Content>
          <ItemSelector
            onClose={this.props.onClose}
            onSelection={this.selectTerrain}
            items={fromJS(toArr(this.props.terrains).filter(terrain => this.props.info && (!this.props.info.location || terrain.location === this.props.info.location)))}
            attributes={fromJS(attributes)}
          />
        </Modal.Content>
      </Modal>
    )
  }

  selectTerrain = (type: TerrainType | undefined): void => (
    this.props.info && type && this.props.selectTerrain(this.props.mode, this.props.info.index, type)
  )
}

const mapStateToProps = (state: AppState) => ({
  terrains: filterTerrains(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTerrain: (mode: DefinitionType, index: number, type: TerrainType) => dispatch(selectTerrain(mode, index, type)) && dispatch(invalidate(mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTerrainSelector)
