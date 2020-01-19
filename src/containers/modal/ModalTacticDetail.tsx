import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setBaseValue, ValueType, TacticType, changeImage, changeMode } from '../../store/tactics'
import { AppState } from '../../store/'
import { invalidate } from '../../store/battle'
import TacticDetail from '../../components/TacticDetail'
import { Mode, DefinitionType } from '../../base_definition'
import { mergeUnitTypes, filterTacticTypes, filterTactics, getUnitImages } from '../../store/utils'

const CUSTOM_VALUE_KEY = 'Custom'

class ModalTacticDetail extends Component<IProps> {
  render() {
    const { tactic, mode, images, tactics, tactic_types, unit_types, setBaseValue, changeType, changeImage, changeMode } = this.props
    if (!tactic)
      return null
    return (
      <TacticDetail
        tactics={tactics}
        tactic_types={tactic_types}
        unit_types={unit_types}
        images={images}
        custom_value_key={CUSTOM_VALUE_KEY}
        tactic={tactics[tactic]}
        onCustomBaseValueChange={(key, attribute, value) => setBaseValue(mode, tactic, key, attribute, value)}
        onTypeChange={type => changeType(tactic, type)}
        onImageChange={image => changeImage(tactic, image)}
        onModeChange={mode => changeMode(tactic, mode)}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  tactics: filterTactics(state),
  tactic_types: filterTacticTypes(state),
  images: getUnitImages(state),
  unit_types: mergeUnitTypes(state),
  mode: state.settings.mode
})

const mapDispatchToProps = (dispatch: any) => ({
  setBaseValue: (mode: Mode, tactic: TacticType,  key: string, attribute: ValueType, value: number) => (
    !Number.isNaN(value) && dispatch(setBaseValue(tactic, key, attribute, value)) && dispatch(invalidate(mode))
  ),
  changeImage: (type: TacticType, image: string) => dispatch(changeImage(type, image)),
  changeMode: (type: TacticType, mode: DefinitionType) => dispatch(changeMode(type, mode))
})

interface IProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
  tactic: TacticType | null
  changeType: (old_type: TacticType, new_type: TacticType) => void
 }

export default connect(mapStateToProps, mapDispatchToProps)(ModalTacticDetail)
