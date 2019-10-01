import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal } from 'semantic-ui-react'
import { AppState } from '../store/'
import { selectTactic, invalidate, BaseDefeated, BaseReserve, BaseFrontLine } from '../store/battle'
import { calculateTactic } from '../store/combat'
import ItemSelector, { SelectorAttributes } from '../components/ItemSelector'
import { TacticType, TacticCalc } from '../store/tactics'
import { getBattle, filterTactics } from '../store/utils'
import { mergeValues, calculateValue, Mode } from '../base_definition'
import { toSignedPercent, toPercent } from '../formatters'
import { CountryName } from '../store/countries'
import StyledNumber from '../components/Utils/StyledNumber';
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
      reserve: this.mergeAllValues(country, participant.reserve) as BaseReserve,
      defeated: this.mergeAllValues(country, participant.defeated) as BaseDefeated
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
          onSelection={this.selectTactic}
          items={toArr(this.props.tactics)}
          attributes={attributes}
        />
      </Modal.Content>
    </Modal>
    )
  }

  selectTactic = (type: TacticType | null): void => {
    this.props.info && type && this.props.selectTactic(this.props.mode, this.props.info.country, type)
    this.props.onClose()
  }


  mergeAllValues = (name: CountryName, army: BaseFrontLine): BaseFrontLine => {
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
