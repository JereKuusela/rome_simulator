import React, { Component } from 'react'
import { Header } from 'semantic-ui-react'
import { VictoryAxis, VictoryArea } from 'victory'
import { sortBy } from 'lodash'

import BaseChart from './BaseChart'

import { toPercent } from '../../formatters'
import { toArr, mapRange } from '../../utils'

interface IProps {
  rounds: { [key: number]: number }
  progress: number
}

interface IState {
  label: string
}

interface Datum {
  y: number
  childName: string
  x: number
}

interface ChartData {
  values: { x: number; y: number }[]
  cumulative: { x: number; y: number }[]
}

const CUMULATIVE = 'CUMULATIVE'
const VALUES = 'VALUES'

/**
 * Shows a chart for length of a battle.
 */
export default class RoundChart extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = { label: 'Hover over the chart for details' }
  }

  toPercent = (value: number) => toPercent(value, 1)

  calculate = (values: { [key: string]: number }, progress: number): ChartData => {
    const data: ChartData = { values: [], cumulative: [] }
    data.values = sortBy(
      toArr(values, (count, value) => ({ x: Number(value), y: count / progress })),
      item => item.x
    )
    let count = 0
    for (const value of data.values) {
      count += value.y
      data.cumulative.push({ x: value.x, y: count })
    }
    return data
  }

  render() {
    const { rounds, progress } = this.props
    const { label } = this.state
    const data = this.calculate(rounds, progress)
    const roundTicks = mapRange(
      data.cumulative.length ? data.cumulative[data.cumulative.length - 1].x + 1 : 11,
      value => value
    )

    return (
      <>
        <Header textAlign='center' size='huge'>
          Rounds
        </Header>
        <Header textAlign='center'>{label}</Header>
        <BaseChart onActivated={this.onActivated} getTooltip={this.getTooltip}>
          <VictoryAxis tickValues={roundTicks} />
          <VictoryAxis dependentAxis tickFormat={x => `${x * 100}%`} />
          <VictoryArea
            interpolation='natural'
            data={data.cumulative}
            style={{
              data: { fill: 'grey' }
            }}
            name={CUMULATIVE}
          />
          <VictoryArea
            interpolation='natural'
            data={data.values}
            style={{
              data: { fill: 'black' }
            }}
            name={VALUES}
          />
        </BaseChart>
      </>
    )
  }

  onActivated = (datums: Datum[]) => {
    if (datums.length) {
      const datum = datums[0]
      const label = this.getLabel(datum)
      this.setState({ label })
    }
  }

  getLabel = (datum: Datum) => {
    if (datum.childName === VALUES) return `${this.toPercent(datum.y)} of battles end at round ${datum.x}`
    if (datum.childName === CUMULATIVE) return `${this.toPercent(datum.y)} of battles end during ${datum.x} rounds`
    return ''
  }

  getTooltip = (datum: Datum) => `Round ${datum.x}: ${this.toPercent(datum.y)}`
}
