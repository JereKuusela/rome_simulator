import React, { Component } from 'react'
import { TacticType, Tactic, CombatSharedSettings, TacticMatch } from 'types'
import DropdownTable from './DropdownTable'
import StyledNumber from 'components/Utils/StyledNumber'
import { toPercent, toSignedPercent } from 'formatters'
import LabelItem from 'components/Utils/LabelUnit'

type IProps = {
  value: TacticType
  values: Tactic[]
  settings: CombatSharedSettings
  onSelect: (type: TacticType) => void
}

export default class DropdownTactic extends Component<IProps> {
  getContent = (tactic: Tactic) => [
    <LabelItem item={tactic} />,
    <StyledNumber value={tactic.effect} formatter={toPercent} />,
    <StyledNumber
      value={tactic.damage}
      formatter={toSignedPercent}
      hideZero={tactic.match === TacticMatch.Neutral}
      neutralColor='color-positive'
    />,
    <StyledNumber value={tactic.casualties} formatter={toSignedPercent} hideZero />
  ]

  isActive = (item: Tactic) => item.type === this.props.value
  isPositive = (item: Tactic) => item.match === TacticMatch.Positive
  isNegative = (item: Tactic) => item.match === TacticMatch.Negative

  getValue = (item: Tactic) => item.type

  headers = ['Tactic', 'Effect', 'Damage', 'Casualties']

  render() {
    const { value, values, onSelect, settings } = this.props
    return (
      <DropdownTable
        value={value}
        values={values}
        headers={this.headers}
        getContent={this.getContent}
        isActive={this.isActive}
        getValue={this.getValue}
        isPositive={this.isPositive}
        isNegative={this.isNegative}
        onSelect={onSelect}
        trigger={<LabelItem item={values.find(tactic => tactic.type === value)} />}
        settings={settings}
        width={150}
      />
    )
  }
}
