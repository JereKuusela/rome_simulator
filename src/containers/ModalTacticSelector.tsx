import React, { Component } from 'react'
import { Map, List } from 'immutable'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTactic } from '../store/battle'
import { calculateTactic } from '../store/combat'
import ItemSelector from '../components/ItemSelector'
import { TacticType, TacticCalc } from '../store/tactics'
import { getBattle, filterTactics } from '../store/utils'
import { DefinitionType, mergeValues, calculateValue } from '../base_definition'
import { toSignedPercent, toPercent } from '../formatters'
import { UnitDefinition, Unit } from '../store/units'
import { CountryName } from '../store/countries'
import StyledNumber from '../components/StyledNumber';

export interface ModalInfo {
  country: CountryName
  counter?: TacticType
}

class ModalTacticSelector extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    const country = this.props.info.country
    const participant = this.props.armies.get(country)
    const army = participant && {
      frontline: this.mergeAllValues(country, participant.frontline),
      reserve: this.mergeAllValues(country, participant.reserve) as List<UnitDefinition>,
      defeated: this.mergeAllValues(country, participant.defeated) as List<UnitDefinition>
    }
    let attributes = Map<string, Map<TacticType, JSX.Element>>()
    attributes = attributes.set('effect', this.props.tactics.map(value => (
        <StyledNumber
         value={calculateTactic(army, value)}
         formatter={toPercent}
        /> 
    )))
    attributes = attributes.set('damage', this.props.tactics.map(value => (
       <StyledNumber
        value={calculateTactic(army, value, this.props.info!.counter)}
        formatter={toSignedPercent}
       /> 
    )))
    attributes = attributes.set('casualties', this.props.tactics.filter(value => calculateValue(value, TacticCalc.Casualties)).map(value => (
      <StyledNumber
        value={calculateValue(value, TacticCalc.Casualties)}
        formatter={toSignedPercent}
        reverse
       /> 
    )))
    return (
    <Modal basic onClose={this.props.onClose} open>
      <Modal.Content>
        <ItemSelector
          onClose={this.props.onClose}
          onSelection={this.selectTactic}
          items={this.props.tactics.toList()}
          attributes={attributes}
        />
      </Modal.Content>
    </Modal>
    )
  }

  selectTactic = (type: TacticType | undefined): void => (
    this.props.info && type && this.props.selectTactic(this.props.mode, this.props.info.country, type)
  )

  
  mergeAllValues = (name: CountryName, army: List<Unit | undefined>): List<UnitDefinition | undefined> => {
    return army.map(value => value && mergeValues(mergeValues(this.props.units.getIn([name, value.type]), value), this.props.global_stats.getIn([name, this.props.mode])))
  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: filterTactics(state),
  armies: getBattle(state).armies,
  mode: state.settings.mode,
  units: state.units,
  global_stats: state.global_stats
})

const mapDispatchToProps = (dispatch: any) => ({
  selectTactic: (mode: DefinitionType, name: CountryName, type: TacticType) => dispatch(selectTactic(mode, name, type))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticSelector)
