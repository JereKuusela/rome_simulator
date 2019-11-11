import React, { Component } from 'react'
import { Header } from 'semantic-ui-react'
import { VictoryChart, VictoryVoronoiContainer, VictoryTheme, VictoryAxis, VictoryArea } from 'victory'
import { sortBy } from 'lodash'

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

  render() {
    const { rounds, progress } = this.props
    const { label } = this.state
    const round_values = sortBy(toArr(rounds, (count, round) => ({ x: Number(round), y: count / progress })), item => item.x)
    const round_cumulative: { x: number, y: number }[] = []
    let count = 0
    for (let i = 0; i < round_values.length; i++) {
      count += round_values[i].y
      round_cumulative.push({ x: round_values[i].x, y: count })
    }
    const round_ticks = mapRange(round_cumulative.length ? round_cumulative[round_cumulative.length - 1].x + 1 : 11, value => value)

    return (
      <>
        <Header textAlign='center' size='huge'>Rounds</Header>
        <Header textAlign='center' >{label}</Header>
        <VictoryChart
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }) => `Round ${datum.x}: ${this.toPercent(datum.y)}`}
              onActivated={this.onActivated}
            />
          }
          theme={VictoryTheme.material}
          domainPadding={10}
          padding={{ top: 25, left: 50, bottom: 30, right: 50 }}
        >
          <VictoryAxis
            tickValues={round_ticks}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(x) => (`${x * 100}%`)}
          />
          <VictoryArea
            interpolation="natural"
            data={round_cumulative}
            style={{
              data: { fill: "grey" }
            }}
            name={CUMULATIVE}
          />
          <VictoryArea
            interpolation="natural"
            data={round_values}
            style={{
              data: { fill: "black" }
            }}
            name={VALUES}
          />
        </VictoryChart>
      </>
    )
  }

  onActivated = (datums: Datum[]) => {
    if (datums.length) {
      const datum = datums[0]
      const label = this.getTooltip(datum)
      this.setState({ label })
    }
  }

  getTooltip = (datum: Datum) => {
    if (datum.childName === VALUES)
      return `${this.toPercent(datum.y)} of battles end at round ${datum.x}`
    if (datum.childName === CUMULATIVE)
      return `${this.toPercent(datum.y)} of battles end during ${datum.x} rounds`
    return ''
  }
}
