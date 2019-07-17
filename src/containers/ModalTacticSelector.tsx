import React, { Component } from 'react'
import { Map, List } from 'immutable'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTactic } from '../store/battle'
import { calculateTactic } from '../store/combat'
import ItemSelector from '../components/ItemSelector'
import { TacticType } from '../store/tactics'
import { getBattle } from '../store/utils'
import { toRelativePercent, toPercent, DefinitionType, mergeValues } from '../base_definition'
import { UnitDefinition, Unit } from '../store/units'
import { CountryName } from '../store/countries'

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
    let custom_values = Map<string, Map<TacticType, string>>()
    custom_values = custom_values.set('effect', this.props.tactics.map(value => {
      return toPercent(calculateTactic(army, value), 100, true, false)
    }))
    custom_values = custom_values.set('damage', this.props.tactics.map(value => {
      return toRelativePercent(calculateTactic(army, value, this.props.info!.counter), true)
    }))
    return (
    <Modal basic onClose={this.props.onClose} open>
      <Modal.Content>
        <ItemSelector
          onClose={this.props.onClose}
          onSelection={this.selectTactic}
          items={this.props.tactics.filter(tactic => (tactic.mode === this.props.mode || tactic.mode === DefinitionType.Global)).toList()}
          attributes={[]}
          custom_values={custom_values}
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
  tactics: state.tactics.definitions,
  armies: getBattle(state).armies,
  mode: state.settings.mode,
  units: state.units.definitions,
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
