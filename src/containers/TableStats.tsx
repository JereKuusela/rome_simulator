import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import IconEmpty from 'images/empty.png'
import { SideType, UnitType, UnitAttribute, isAttributeEnabled, Cohorts, Cohort } from 'types'
import { strengthToValue, toNumber } from 'formatters'
import { getImage, round, sumArr } from 'utils'
import { AppState, getCurrentCombat, getMode, getBattle, getSiteSettings } from 'state'
import { flatten, uniq } from 'lodash'
import AttributeImage from 'components/Utils/AttributeImage'

type Props = {}

class TableStats extends Component<IProps> {

  shouldComponentUpdate(prevProps: IProps) {
    return prevProps.timestamp !== this.props.timestamp
  }

  render() {
    return (
      <>
        {this.renderArmy(SideType.Attacker, this.props.cohortsA)}
        {this.renderArmy(SideType.Defender, this.props.cohortsD)}
      </>
    )
  }

  renderArmy = (side: SideType, cohorts: Cohorts) => {
    const { mode, settings } = this.props
    const flatten = this.flatten(cohorts)
    const types = uniq(flatten.map(cohort => cohort.properties.type))
    const rows = types.map(type => this.renderRow(cohorts, type)).filter(row => row)
    return (
      <Table celled unstackable key={side} singleLine>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width='4'>
              {side}
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              <AttributeImage attribute={UnitAttribute.Strength} mode={mode} settings={settings} />
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              <AttributeImage attribute={UnitAttribute.Morale} settings={settings} />
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              Strength depleted
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              Morale depleted
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              <AttributeImage attribute={UnitAttribute.Cost} settings={settings} />
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              Monthly <AttributeImage attribute={UnitAttribute.Cost} settings={settings} />
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              <AttributeImage attribute={UnitAttribute.AttritionWeight} settings={settings} />
            </Table.HeaderCell>
            {
              isAttributeEnabled(UnitAttribute.FoodConsumption, settings) &&
              <Table.HeaderCell width='3'>
                <AttributeImage attribute={UnitAttribute.FoodConsumption} settings={settings} />
              </Table.HeaderCell>
            }
            {
              isAttributeEnabled(UnitAttribute.FoodStorage, settings) &&
              <Table.HeaderCell width='3'>
                <AttributeImage attribute={UnitAttribute.FoodStorage} settings={settings} />
              </Table.HeaderCell>
            }
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows}
          <Table.Row>
            <Table.Cell width='4'>
              <Image src={IconEmpty} avatar />
              Total
            </Table.Cell>
            {this.renderCells(flatten)}
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderRow = (cohorts: Cohorts, type: UnitType) => {
    const flatten = this.flatten(cohorts, type)
    const count = flatten.length
    if (count === 0)
      return null
    const image = getImage(flatten[0].properties)
    return (
      <Table.Row key={type}>
        <Table.Cell width='4'>
          <Image src={image} avatar />
          {type + ' (x ' + count + ')'}
        </Table.Cell>
        {this.renderCells(flatten)}
      </Table.Row>
    )
  }

  renderCells = (cohorts: Cohort[]) => {
    const { mode } = this.props
    return (
      <>
        <Table.Cell width='3'>
          {strengthToValue(mode, this.sum(cohorts, cohort => cohort[UnitAttribute.Strength]))} / {strengthToValue(mode, this.sum(cohorts, cohort => cohort.properties.maxStrength))}
        </Table.Cell>
        <Table.Cell width='3'>
          {round(this.sum(cohorts, cohort => cohort[UnitAttribute.Morale]), 100.0)} / {round(this.sum(cohorts, cohort => cohort.properties.maxMorale), 100.0)}
        </Table.Cell>
        <Table.Cell width='3'>
          {strengthToValue(mode, this.sum(cohorts, cohort => cohort.state.totalStrengthDealt))}
        </Table.Cell>
        <Table.Cell width='3'>
          {round(this.sum(cohorts, cohort => cohort.state.totalMoraleDealt), 100.0)}
        </Table.Cell>
        {this.renderCell(cohorts, UnitAttribute.Cost)}
        <Table.Cell width='3'>
          {round(this.sum(cohorts, cohort => cohort.properties[UnitAttribute.Cost] * cohort.properties[UnitAttribute.Maintenance]), 100.0)}
        </Table.Cell>
        {this.renderCell(cohorts, UnitAttribute.AttritionWeight)}
        {this.renderCell(cohorts, UnitAttribute.FoodConsumption)}
        {this.renderCell(cohorts, UnitAttribute.FoodStorage, this.storageFormatter)}
      </>
    )
  }

  renderCell = (cohorts: Cohort[], attribute: UnitAttribute, formatter?: (cohorts: Cohort[], attribute: UnitAttribute) => string) => {
    const { settings } = this.props
    if (isAttributeEnabled(attribute, settings)) {
      return (
        <Table.Cell width='3'>
          {formatter ? formatter(cohorts, attribute) : this.defaultFormatter(cohorts, attribute)}
        </Table.Cell>
      )
    }
    return null
  }

  defaultFormatter = (cohorts: Cohort[], attribute: UnitAttribute) => {
    return round(this.sum(cohorts, cohort => cohort.properties[attribute]), 100.0)
  }

  storageFormatter = (cohorts: Cohort[]) => {
    const storage = this.sum(cohorts, cohort => cohort.properties[UnitAttribute.FoodStorage])
    const consumption = this.sum(cohorts, cohort => cohort.properties[UnitAttribute.FoodConsumption]) || 1.0
    return `${toNumber(storage / consumption / 12)} years (${toNumber(storage)})`
  }

  sum = (merged: Cohort[], getAttribute: (cohort: Cohort) => number): number => sumArr(merged, getAttribute)

  // Flattens units to a single list. Also filters temporary 'defeated' units because they are copies of another unit.
  flatten = (cohorts: Cohorts, type?: UnitType): Cohort[] => (
    cohorts.reserve.front.filter(cohort => this.filter(cohort, type)).concat(cohorts.reserve.flank.filter(cohort => this.filter(cohort, type))).concat(cohorts.reserve.support.filter(cohort => this.filter(cohort, type)))
      .concat(cohorts.defeated.filter(cohort => this.filter(cohort, type)).concat(flatten(cohorts.frontline).filter(cohort => this.filter(cohort, type)) as Cohort[]))
  )

  filter = (cohort: Cohort | null, type?: UnitType) => cohort && !cohort.state.isDefeated && (!type || cohort.properties.type === type)
}

const mapStateToProps = (state: AppState) => ({
  cohortsA: getCurrentCombat(state, SideType.Attacker),
  cohortsD: getCurrentCombat(state, SideType.Defender),
  mode: getMode(state),
  settings: getSiteSettings(state),
  timestamp: getBattle(state).timestamp
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableStats)
