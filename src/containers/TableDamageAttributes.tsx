import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Input } from 'semantic-ui-react'

import { Side, CountryName, UnitAttribute, CombatPhase, General, GeneralValueType, Mode, UnitType } from 'types'
import { AppState, getGeneral, getUnit, getMode } from 'state'
import { setGeneralBaseStat, invalidate } from 'reducers'
import AttributeImage from 'components/Utils/AttributeImage'
import StyledNumber from 'components/Utils/StyledNumber'
import { addSign } from 'formatters'
import UnitValueInput from './UnitValueInput'

type Props = {
  side: Side
  country: CountryName
}

class TableDamageAttributes extends Component<IProps> {

  render() {
    const { side, general, unit, country } = this.props
    return (
      <Table celled unstackable key={side}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              {side}
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={CombatPhase.Fire} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={CombatPhase.Shock} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              General
            </Table.Cell>
            <Table.Cell>
              {this.renderGeneralAttribute(general, CombatPhase.Fire)}
            </Table.Cell>
            <Table.Cell>
              {this.renderGeneralAttribute(general, CombatPhase.Shock)}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Damage done
            </Table.Cell>
            <Table.Cell>
              <UnitValueInput unit={unit} attribute={UnitAttribute.FireDamageDone} country={country} percent />
            </Table.Cell>
            <Table.Cell>
              <UnitValueInput unit={unit} attribute={UnitAttribute.ShockDamageDone} country={country} percent />
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              Damage taken
            </Table.Cell>
            <Table.Cell>
              <UnitValueInput unit={unit} attribute={UnitAttribute.FireDamageTaken} country={country} percent />
            </Table.Cell>
            <Table.Cell>
              <UnitValueInput unit={unit} attribute={UnitAttribute.ShockDamageTaken} country={country} percent />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }

  renderGeneralAttribute = (general: General, attribute: GeneralValueType) => (
    <>
      <Input disabled={!general.enabled} size='mini' className='small-input' type='number' value={general.base_values[attribute]} onChange={(_, { value }) => this.setGeneralStat(attribute, Number(value))} />
      {' '} <StyledNumber value={general.extra_values[attribute]} formatter={addSign} hide_zero />
    </>
  )

  setGeneralStat = (attribute: GeneralValueType, value: number) => {
    const { country, invalidate, setGeneralBaseStat } = this.props

    setGeneralBaseStat(country, attribute, value)
    invalidate()
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  general: getGeneral(state, props.country),
  unit: getUnit(state, getMode(state) === Mode.Naval ? UnitType.Naval : UnitType.Land, props.country)
})

const actions = { invalidate, setGeneralBaseStat }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableDamageAttributes)
