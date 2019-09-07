import React, { Component } from 'react'
import { List } from 'immutable'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTactic, invalidate } from '../store/battle'
import { calculateTactic } from '../store/combat'
import ItemSelector, { SelectorAttributes } from '../components/ItemSelector'
import { TacticType, TacticCalc } from '../store/tactics'
import { getBattle, filterTactics } from '../store/utils'
import { mergeValues, calculateValue, Mode } from '../base_definition'
import { toSignedPercent, toPercent } from '../formatters'
import { BaseUnit } from '../store/units'
import { CountryName } from '../store/countries'
import StyledNumber from '../components/StyledNumber';
import { map, filter, toArr } from '../utils';

export interface ModalInfo {
  country: CountryName
  counter?: TacticType
}

class ModalTacticSelector extends Component<IProps> {
  render(): JSX.Element | null {
    if (!this.props.info)
      return null
    const country = this.props.info.country
    const participant = this.props.armies[country]
    const army = participant && {
      frontline: this.mergeAllValues(country, participant.frontline),
      reserve: this.mergeAllValues(country, participant.reserve) as List<BaseUnit>,
      defeated: this.mergeAllValues(country, participant.defeated) as List<BaseUnit>
    }
    const attributes = {} as SelectorAttributes<TacticType>
    attributes['effect'] =  map(this.props.tactics, value => (
        <StyledNumber
         value={calculateTactic(army, value)}
         formatter={toPercent}
        /> 
    ))
    attributes['damage'] = map(this.props.tactics, value => (
       <StyledNumber
        value={calculateTactic(army, value, this.props.info!.counter)}
        formatter={toSignedPercent}
       /> 
    ))
    attributes['casualties'] = map(filter(this.props.tactics, value => calculateValue(value, TacticCalc.Casualties)),value => (
      <StyledNumber
        value={calculateValue(value, TacticCalc.Casualties)}
        formatter={toSignedPercent}
        reverse
       /> 
    ))
    return (
    <Modal basic onClose={this.props.onClose} open>
      <Modal.Content>
        <ItemSelector
          onClose={this.props.onClose}
          onSelection={this.selectTactic}
          items={toArr(this.props.tactics)}
          attributes={attributes}
        />
      </Modal.Content>
    </Modal>
    )
  }

  selectTactic = (type: TacticType | undefined): void => (
    this.props.info && type && this.props.selectTactic(this.props.mode, this.props.info.country, type)
  )

  
  mergeAllValues = (name: CountryName, army: List<BaseUnit | undefined>): List<BaseUnit | undefined> => {
    return army.map(value => value && mergeValues(mergeValues(this.props.units[name][value.type], value), this.props.global_stats[name][this.props.mode]))
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
  selectTactic: (mode: Mode, name: CountryName, type: TacticType) => dispatch(selectTactic(mode, name, type)) && dispatch(invalidate(mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  info: ModalInfo | null
  onClose: () => void
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticSelector)
