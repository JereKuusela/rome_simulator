import React, { Component } from 'react'
import { Header } from 'semantic-ui-react'
import { VictoryAxis, VictoryArea } from 'victory'
import { sortBy, capitalize } from 'lodash'

import BaseChart from './BaseChart'

import { toPercent } from '../../formatters'
import { toArr, mapRange } from '../../utils'

interface IProps {
  a: { [key: string]: number }
  d: { [key: string]: number }
  max_a: number
  max_d: number
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

const CUMULATIVE = 'CUMULATIVE'
const PERCENT = 'PERCENT'

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
    const { a, d, max_a, max_d, type, progress } = this.props
    const { label } = this.state

    const data_a = this.calculate(a, max_a, progress, true)
    const data_d = this.calculate(d, max_d, progress, false)

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
            interpolation="natural"
            data={data_a.cumulative}
            style={{
              data: { fill: "#FFAA00AA" }
            }}
            name={CUMULATIVE}
          />
          <VictoryArea
            interpolation="natural"
            data={data_a.percent}
            style={{
              data: { fill: "#FFAA00" }
            }}
            name={PERCENT}
          />
          <VictoryArea
            interpolation="natural"
            data={data_d.cumulative}
            style={{
              data: { fill: "#00AAFFAA" }
            }}
            name={CUMULATIVE}
          />
          <VictoryArea
            interpolation="natural"
            data={data_d.percent}
            style={{
              data: { fill: "#00AAFF" }
            }}
            name={PERCENT}
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
    if (childName === PERCENT)
      return `${this.toPercent(x)} chance to have ${this.toPercent(y)} or more ${type} remaining`
    if (childName === CUMULATIVE)
      return `${this.toPercent(x)} chance to have ${y} or more ${type} remaining`
    return ''
  }

  getTooltip = (datum: Datum) => {
    const { type } = this.props
    let { x, y, childName } = datum
    x = 1 - x
    if (x > 1)
      x = 2 - x
    if (childName === PERCENT)
      return `${capitalize(type)} ${this.toPercent(y)}: ${this.toPercent(x)}`
    if (childName === CUMULATIVE)
      return `${capitalize(type)} ${y}: ${this.toPercent(x)}`
    return ''
  }
}
