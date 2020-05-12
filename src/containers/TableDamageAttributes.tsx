import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table } from 'semantic-ui-react'

import { SideType, CountryName, UnitAttribute, CombatPhase, GeneralDefinition, GeneralValueType, Mode, UnitType, ArmyName } from 'types'
import { AppState, getGeneral, getUnit, getMode, getSiteSettings } from 'state'
import { setGeneralAttribute } from 'reducers'
import AttributeImage from 'components/Utils/AttributeImage'
import StyledNumber from 'components/Utils/StyledNumber'
import { addSign } from 'formatters'
import UnitValueInput from './UnitValueInput'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'

type Props = {
  side: SideType
  country: CountryName
  army: ArmyName
}

class TableDamageAttributes extends Component<IProps> {

  shouldComponentUpdate(prevProps: IProps) {
    return prevProps.country !== this.props.country
  }

  render() {
    const { side, general, unit, country, settings } = this.props
    return (
      <Table celled unstackable key={side}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              {side}
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={CombatPhase.Fire} settings={settings} />
            </Table.HeaderCell>
            <Table.HeaderCell>
              <AttributeImage attribute={CombatPhase.Shock} settings={settings} />
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

  renderGeneralAttribute = (general: GeneralDefinition, attribute: GeneralValueType) => (
    <>
      <DelayedNumericInput disabled={!general.enabled}  type='number' value={general.baseValues[attribute]} onChange={value => this.setGeneralStat(attribute, Number(value))}/>
      {' '} <StyledNumber value={general.extraValues[attribute]} formatter={addSign} hideZero />
    </>
  )

  setGeneralStat = (attribute: GeneralValueType, value: number) => {
    const { country, army, setGeneralAttribute } = this.props
    setGeneralAttribute(country, army, attribute, value)
  }
}

const mapStateToProps = (state: AppState, props: Props) => ({
  general: getGeneral(state, props.country, props.army),
  unit: getUnit(state, getMode(state) === Mode.Naval ? UnitType.Naval : UnitType.Land, props.country),
  settings: getSiteSettings(state)
})

const actions = { setGeneralAttribute }

type S = ReturnType<typeof mapStateToProps>
type D = typeof actions
interface IProps extends React.PropsWithChildren<Props>, S, D { }

export default connect(mapStateToProps, actions)(TableDamageAttributes)
