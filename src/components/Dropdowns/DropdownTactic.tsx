import React, { Component } from 'react'
import { TacticType, Tactic, SiteSettings } from 'types'
import DropdownTable from './DropdownTable'
import StyledNumber from 'components/Utils/StyledNumber'
import { toPercent, toSignedPercent } from 'formatters'
import LabelItem from 'components/Utils/LabelUnit'

type IProps = {
  value: TacticType
  values: Tactic[]
  settings: SiteSettings
  onSelect: (type: TacticType) => void
}

export default class DropdownTactic extends Component<IProps> {

  getContent = (tactic: Tactic) => ([
    <LabelItem item={tactic} />,
    <StyledNumber
      value={tactic.effect}
      formatter={toPercent}
    />,
    <StyledNumber
      value={tactic.damage}
      formatter={toSignedPercent}
      hide_zero
    />,
    <StyledNumber
      value={tactic.casualties}
      formatter={toSignedPercent}
      hide_zero
    />
  ])

  headers = ['Tactic', 'Effect', 'Damage', 'Casualties']

  render() {
    const { value, values, onSelect, settings } = this.props
    return (
      <DropdownTable value={value} values={values}
        headers={this.headers}
        getContent={this.getContent}
        onSelect={onSelect}
        trigger={<LabelItem item={values.find(tactic => tactic.type === value)} />}
        settings={settings}
      />
    )
  }
}
