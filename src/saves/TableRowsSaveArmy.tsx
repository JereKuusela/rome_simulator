import AttributeImage from 'components/Utils/AttributeImage'
import LabelItem from 'components/Utils/LabelUnit'
import { abilitiesIR, getDefaultUnits, traitsIR } from 'data'
import { uniq } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { Table } from 'semantic-ui-react'
import type { AppState } from 'reducers'
import { Mode, CharacterAttribute, UnitPreferenceType, UnitType } from 'types'
import { toObj, toArr } from 'utils'
import { SaveArmy } from './types'

const TableRowsSaveArmy = ({ army }: { army: SaveArmy }) => {
  const tactics = useSelector((state: AppState) => state.tactics)
  const units = getDefaultUnits()
  const cohorts = army.cohorts.map(cohort => cohort.type)
  const types = uniq(cohorts)
  const counts = toObj(
    types,
    type => type,
    type => cohorts.filter(item => item === type).length
  )
  const ability = abilitiesIR.get(army.ability)
  return (
    <>
      <Table.Row>
        <Table.Cell />
        <Table.Cell />
        <Table.Cell />
        <Table.Cell />
      </Table.Row>
      <Table.Row>
        <Table.Cell>Name</Table.Cell>
        <Table.Cell colSpan='3'>{army.name}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>{army.mode === Mode.Naval ? 'Adminal' : 'General'}</Table.Cell>
        <Table.Cell>{army.leader ? army.leader.name : ''}</Table.Cell>
        <Table.Cell>
          {army.leader ? (
            <>
              <AttributeImage attribute={CharacterAttribute.Martial} />
              {' ' + army.leader[CharacterAttribute.Martial]}
            </>
          ) : (
            ''
          )}
        </Table.Cell>
        <Table.Cell>{army.leader ? army.leader.traits.map(key => traitsIR.get(key)?.name).join(', ') : ''}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Tactic / Ability</Table.Cell>
        <Table.Cell>
          <LabelItem item={tactics[army.tactic]} />
          {ability ? ' / ' + ability : null}
        </Table.Cell>
        <Table.Cell>Flank size</Table.Cell>
        <Table.Cell>{army.flankSize}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Preferences</Table.Cell>
        <Table.Cell colSpan='3'>
          <LabelItem item={units[army.preferences[UnitPreferenceType.Primary] ?? UnitType.Archers]} />{' '}
          <LabelItem item={units[army.preferences[UnitPreferenceType.Secondary] ?? UnitType.Archers]} />{' '}
          <LabelItem item={units[army.preferences[UnitPreferenceType.Flank] ?? UnitType.Archers]} />
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Cohorts</Table.Cell>
        <Table.Cell colSpan='3'>
          {toArr(counts, (value, key) => (
            <span key={key} style={{ paddingRight: '1em' }}>
              <LabelItem item={units[key]} />
              {' x ' + value}
            </span>
          ))}
        </Table.Cell>
      </Table.Row>
    </>
  )
}

export default TableRowsSaveArmy
