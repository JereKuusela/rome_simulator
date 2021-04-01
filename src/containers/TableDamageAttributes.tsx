import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Table } from 'semantic-ui-react'

import { SideType, CountryName, UnitAttribute, CombatPhase, GeneralDefinition, GeneralValueType, ArmyName } from 'types'
import { useUnitDefinition } from 'state'
import { setGeneralAttribute } from 'reducers'
import AttributeImage from 'components/Utils/AttributeImage'
import StyledNumber from 'components/Utils/StyledNumber'
import { addSign } from 'formatters'
import UnitValueInput from './UnitValueInput'
import DelayedNumericInput from 'components/Detail/DelayedNumericInput'
import { getRootParent } from 'managers/units'
import { useGeneral, useMode, useCombatSettings } from 'selectors'

type Props = {
  side: SideType
  countryName: CountryName
  armyName: ArmyName
}

const TableDamageAttributes = ({ side, countryName, armyName }: Props): JSX.Element | null => {
  const settings = useCombatSettings()
  const mode = useMode()
  const unit = useUnitDefinition(countryName, armyName, getRootParent(mode))
  const general = useGeneral(countryName, armyName)
  if (!unit || !general) return null
  return (
    <Table celled unstackable key={side}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{side}</Table.HeaderCell>
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
          <Table.Cell>General</Table.Cell>
          <Table.Cell>
            <GeneralAttribute
              armyName={armyName}
              countryName={countryName}
              attribute={CombatPhase.Fire}
              general={general}
            />
          </Table.Cell>
          <Table.Cell>
            <GeneralAttribute
              armyName={armyName}
              countryName={countryName}
              attribute={CombatPhase.Shock}
              general={general}
            />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Damage done</Table.Cell>
          <Table.Cell>
            <UnitValueInput unit={unit} attribute={UnitAttribute.FireDamageDone} country={countryName} percent />
          </Table.Cell>
          <Table.Cell>
            <UnitValueInput unit={unit} attribute={UnitAttribute.ShockDamageDone} country={countryName} percent />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Damage taken</Table.Cell>
          <Table.Cell>
            <UnitValueInput unit={unit} attribute={UnitAttribute.FireDamageTaken} country={countryName} percent />
          </Table.Cell>
          <Table.Cell>
            <UnitValueInput unit={unit} attribute={UnitAttribute.ShockDamageTaken} country={countryName} percent />
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

interface GeneralAttributeProps {
  countryName: CountryName
  armyName: ArmyName
  general: GeneralDefinition
  attribute: GeneralValueType
}

const GeneralAttribute = ({ general, countryName, armyName, attribute }: GeneralAttributeProps) => {
  const dispatch = useDispatch()

  const handleChange = useCallback(
    (value: number) => {
      dispatch(setGeneralAttribute(countryName, armyName, attribute, value))
    },
    [dispatch, countryName, armyName, attribute]
  )

  return (
    <>
      <DelayedNumericInput
        disabled={!general.enabled}
        type='number'
        value={general.baseValues[attribute]}
        onChange={handleChange}
      />{' '}
      <StyledNumber value={general.extraValues[attribute]} formatter={addSign} hideZero />
    </>
  )
}

export default TableDamageAttributes
