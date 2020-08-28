import React, { Component } from 'react'
import { Header } from 'semantic-ui-react'
import { VictoryAxis, VictoryArea } from 'victory'
import { sortBy, capitalize } from 'lodash'

import BaseChart from './BaseChart'
import { toPercent } from 'formatters'
import { toArr, mapRange } from 'utils'
import { SideType } from 'types'

interface IProps {
  a: { [key: string]: number }
  b: { [key: string]: number }
  maxA: number
  maxB: number
  progress: number
  type: string
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
  values: { x: number, y: number }[]
  percent: { x: number, y: number }[]
  cumulative: { x: number, y: number }[]
}

/**
 * Shows a chart used for current morale and strength
 */
export default class CumulativePercentChart extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = { label: 'Hover over the chart for details' }
  }

  toPercent = (value: number) => toPercent(Math.abs(value), 1)

  calculate = (values: { [key: string]: number }, max: number, progress: number, reverse: boolean): ChartData => {
    const data: ChartData = { values: [], percent: [], cumulative: [] }
    if (reverse)
      data.values = sortBy(toArr(values, (count, value) => ({ x: -count / progress, y: Number(value) })), item => -item.y)
    else
      data.values = sortBy(toArr(values, (count, value) => ({ x: count / progress, y: Number(value) })), item => -item.y)
    let count = 1
    for (let value of data.values) {
      count += value.x
      data.cumulative.push({ x: count, y: value.y })
      data.percent.push({ x: count, y: value.y / max })
    }
    return data
  }

  render() {
    const { a, b, maxA, maxB, type, progress } = this.props
    const { label } = this.state

    const dataA = this.calculate(a, maxA, progress, true)
    const dataB = this.calculate(b, maxB, progress, false)

    const ticks = mapRange(9, value => value / 4)

    return (
      <>
        <Header textAlign='center' size='huge'>{`Remaining ${type}`}</Header>
        <Header textAlign='center' >{label}</Header>
        <BaseChart onActivated={this.onActivated} getTooltip={this.getTooltip}>
          <VictoryAxis
            tickValues={ticks}
            tickFormat={(x) => (`${(Math.abs(1 - x)) * 100}%`)}
          />
          <VictoryAxis
            dependentAxis
          />
          <VictoryArea
            interpolation='natural'
            data={dataA.cumulative}
            style={{
              data: { fill: '#FFAA00AA' }
            }}
            name={this.cumulative(SideType.A)}
          />
          <VictoryArea
            interpolation='natural'
            data={dataA.percent}
            style={{
              data: { fill: '#FFAA00' }
            }}
            name={this.percent(SideType.A)}
          />
          <VictoryArea
            interpolation='natural'
            data={dataB.cumulative}
            style={{
              data: { fill: '#00AAFFAA' }
            }}
            name={this.cumulative(SideType.B)}
          />
          <VictoryArea
            interpolation='natural'
            data={dataB.percent}
            style={{
              data: { fill: '#00AAFF' }
            }}
            name={this.percent(SideType.B)}
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
    const { type } = this.props
    let { x, y, childName } = datum
    x = 1 - x
    if (x > 1)
      x = 2 - x
    if (this.isPercent(childName))
      return `${this.toPercent(x)} chance to have ${this.toPercent(y)} or more ${type} remaining`
    if (this.isCumulative(childName))
      return `${this.toPercent(x)} chance to have ${y} or more ${type} remaining`
    return ''
  }

  getTooltip = (datum: Datum) => {
    const { type } = this.props
    let { x, y, childName } = datum
    x = 1 - x
    if (x > 1)
      x = 2 - x
    if (this.isPercent(childName))
      return `${capitalize(type)} ${this.toPercent(y)}: ${this.toPercent(x)}`
    if (this.isCumulative(childName))
      return `${capitalize(type)} ${y}: ${this.toPercent(x)}`
    return ''
  }

  isPercent = (name: string) => name === this.percent(SideType.A) || name === this.percent(SideType.B)
  isCumulative = (name: string) => name === this.cumulative(SideType.A) || name === this.cumulative(SideType.B)

  cumulative = (side: SideType) => `Cumulative_${this.props.type}_${side}`
  percent = (side: SideType) => `Percent_${this.props.type}_${side}`
}
