import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Table } from 'semantic-ui-react'

import IconEmpty from 'images/empty.png'
import { Side, UnitType, UnitAttribute, isAttributeEnabled } from 'types'
import { CombatCohorts, CombatCohort } from 'combat'
import { strengthToValue, toNumber } from 'formatters'
import { getImage, round, sumArr } from 'utils'
import { AppState, getCurrentCombat, getMode, getSettings } from 'state'
import { flatten, uniq } from 'lodash'
import AttributeImage from 'components/Utils/AttributeImage'

type Props = {}

class TableStats extends Component<IProps> {
  render() {
    return (
      <>
        {this.renderArmy(Side.Attacker, this.props.cohorts_a)}
        {this.renderArmy(Side.Defender, this.props.cohorts_d)}
      </ >
    )
  }

  renderArmy = (side: Side, cohorts: CombatCohorts) => {
    const { mode, settings } = this.props
    const flatten = this.flatten(cohorts)
    const types = uniq(flatten.map(cohort => cohort.definition.type))
    const rows = types.map(type => this.renderRow(cohorts, type)).filter(row => row)
    return (
      <Table celled selectable unstackable key={side} singleLine>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width='4'>
              {side}
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              <AttributeImage attribute={UnitAttribute.Strength} mode={mode} />
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              <AttributeImage attribute={UnitAttribute.Morale} />
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              Strength depleted
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              Morale depleted
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              <AttributeImage attribute={UnitAttribute.Cost} />
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              Monthly <AttributeImage attribute={UnitAttribute.Cost} />
            </Table.HeaderCell>
            <Table.HeaderCell width='3'>
              <AttributeImage attribute={UnitAttribute.AttritionWeight} />
            </Table.HeaderCell>
            {
              isAttributeEnabled(UnitAttribute.FoodConsumption, settings) &&
              <Table.HeaderCell width='3'>
                <AttributeImage attribute={UnitAttribute.FoodConsumption} />
              </Table.HeaderCell>
            }
            {
              isAttributeEnabled(UnitAttribute.FoodStorage, settings) &&
              <Table.HeaderCell width='3'>
                <AttributeImage attribute={UnitAttribute.FoodStorage} />
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

  renderRow = (cohorts: CombatCohorts, type: UnitType) => {
    const flatten = this.flatten(cohorts, type)
    const count = flatten.length
    if (count === 0)
      return null
    const image = getImage(flatten[0].definition)
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

  renderCells = (cohorts: CombatCohort[]) => {
    const { mode } = this.props
    return (
      <>
        <Table.Cell width='3'>
          {strengthToValue(mode, this.sum(cohorts, cohort => cohort[UnitAttribute.Strength]))} / {strengthToValue(mode, this.sum(cohorts, cohort => cohort.definition.max_strength))}
        </Table.Cell>
        <Table.Cell width='3'>
          {round(this.sum(cohorts, cohort => cohort[UnitAttribute.Morale]), 100.0)} / {round(this.sum(cohorts, cohort => cohort.definition.max_morale), 100.0)}
        </Table.Cell>
        <Table.Cell width='3'>
          {strengthToValue(mode, this.sum(cohorts, cohort => cohort.state.total_strength_dealt))}
        </Table.Cell>
        <Table.Cell width='3'>
          {round(this.sum(cohorts, cohort => cohort.state.total_morale_dealt), 100.0)}
        </Table.Cell>
        {this.renderCell(cohorts, UnitAttribute.Cost)}
        <Table.Cell width='3'>
          {round(this.sum(cohorts, cohort => cohort.definition[UnitAttribute.Cost] * cohort.definition[UnitAttribute.Maintenance]), 100.0)}
        </Table.Cell>
        {this.renderCell(cohorts, UnitAttribute.AttritionWeight)}
        {this.renderCell(cohorts, UnitAttribute.FoodConsumption)}
        {this.renderCell(cohorts, UnitAttribute.FoodStorage, this.storageFormatter)}
      </>
    )
  }

  renderCell = (cohorts: CombatCohort[], attribute: UnitAttribute, formatter?: (cohorts: CombatCohort[], attribute: UnitAttribute) => string) => {
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

  defaultFormatter = (cohorts: CombatCohort[], attribute: UnitAttribute) => {
    return round(this.sum(cohorts, cohort => cohort.definition[attribute]), 100.0)
  }

  storageFormatter = (cohorts: CombatCohort[]) => {
    const storage = this.sum(cohorts, cohort => cohort.definition[UnitAttribute.FoodStorage])
    const consumption = this.sum(cohorts, cohort => cohort.definition[UnitAttribute.FoodConsumption]) || 1.0
    return `${toNumber(storage / consumption / 12)} years (${toNumber(storage)})`
  }

  sum = (merged: CombatCohort[], getAttribute: (cohort: CombatCohort) => number): number => sumArr(merged, value => Math.max(0, getAttribute(value)))

  // Flattens units to a single list. Also filters temporary 'defeated' units because they are copies of another unit.
  flatten = (cohorts: CombatCohorts, type?: UnitType): CombatCohort[] => (
    cohorts.reserve.front.filter(cohort => this.filter(cohort, type)).concat(cohorts.reserve.flank.filter(cohort => this.filter(cohort, type))).concat(cohorts.reserve.support.filter(cohort => this.filter(cohort, type)))
      .concat(cohorts.defeated.filter(cohort => this.filter(cohort, type)).concat(flatten(cohorts.frontline).filter(cohort => this.filter(cohort, type)) as CombatCohort[]))
  )

  filter = (cohort: CombatCohort | null, type?: UnitType) => cohort && !cohort.state.is_defeated && (!type || cohort.definition.type === type)
}

const mapStateToProps = (state: AppState) => ({
  cohorts_a: getCurrentCombat(state, Side.Attacker),
  cohorts_d: getCurrentCombat(state, Side.Defender),
  mode: getMode(state),
  settings: getSettings(state)
})

const actions = {}

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableStats)
