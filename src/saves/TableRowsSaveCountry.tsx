import {
  culturesIR,
  heritagesIR,
  policiesIR,
  tradesIR,
  ideasIR,
  lawsIR,
  factionsIR,
  religionsIR,
  deitiesIR,
  effectsIR
} from 'data'
import React from 'react'
import { Table } from 'semantic-ui-react'
import { Tech } from 'types/generated'
import { countTech } from './manager'
import { SaveCountry } from './types'

const TableRowsSaveCountry = ({ country }: { country: SaveCountry }) => {
  return (
    <>
      <Table.Row>
        <Table.Cell>Country</Table.Cell>
        <Table.Cell>{country.name}</Table.Cell>
        <Table.Cell>Controller</Table.Cell>
        <Table.Cell>{country.isPlayer ? 'Player' : 'AI'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Civic tech</Table.Cell>
        <Table.Cell>
          Level {country.civicTech} with {countTech(country, Tech.Civic)}
        </Table.Cell>
        <Table.Cell>Martial tech</Table.Cell>
        <Table.Cell>
          Level {country.martialTech} with {countTech(country, Tech.Martial)}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Oratory tech</Table.Cell>
        <Table.Cell>
          Level {country.oratoryTech} with {countTech(country, Tech.Oratory)}
        </Table.Cell>
        <Table.Cell>Religious tech</Table.Cell>
        <Table.Cell>
          Level {country.religiousTech} with {countTech(country, Tech.Religious)}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Culture</Table.Cell>
        <Table.Cell>{culturesIR[country.culture]}</Table.Cell>
        <Table.Cell>Heritage</Table.Cell>
        <Table.Cell>{heritagesIR[country.heritage]?.name}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Army</Table.Cell>
        <Table.Cell>
          {
            policiesIR
              .find(policy => policy.find(option => option.key === country.armyMaintenance))
              ?.find(option => option.key === country.armyMaintenance)?.name
          }
        </Table.Cell>
        <Table.Cell>Navy</Table.Cell>
        <Table.Cell>
          {
            policiesIR
              .find(policy => policy.find(option => option.key === country.navalMaintenance))
              ?.find(option => option.key === country.navalMaintenance)?.name
          }
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Military experience</Table.Cell>
        <Table.Cell>{country.militaryExperience}</Table.Cell>
        <Table.Cell>Traditions</Table.Cell>
        <Table.Cell>{country.traditions.length}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Capital surplus</Table.Cell>
        <Table.Cell>
          {country.surplus
            .map(key => tradesIR[key]?.name)
            .filter(value => value)
            .join(', ')}
        </Table.Cell>
        <Table.Cell>Ideas</Table.Cell>
        <Table.Cell>
          {country.ideas
            .map(key => ideasIR[key]?.name)
            .filter(value => value)
            .join(', ')}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Laws</Table.Cell>
        <Table.Cell>
          {country.laws
            .map(key => lawsIR[key]?.name)
            .filter(value => value)
            .join(', ')}
        </Table.Cell>
        <Table.Cell />
        <Table.Cell />
      </Table.Row>
      <Table.Row>
        <Table.Cell>Government</Table.Cell>
        <Table.Cell>{country.government}</Table.Cell>
        <Table.Cell>Faction</Table.Cell>
        <Table.Cell>{factionsIR[country.faction]?.name}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Religion</Table.Cell>
        <Table.Cell>
          {religionsIR[country.religion]?.name} ({country.religiousUnity.toPrecision(3)}%)
        </Table.Cell>
        <Table.Cell>Deities</Table.Cell>
        <Table.Cell>
          {country.deities
            .map(key =>
              deitiesIR[key]
                ? deitiesIR[key].name + (country.omen.substr(4) === key.substr(5) ? ' (with omen)' : '')
                : null
            )
            .filter(value => value)
            .join(', ')}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Modifiers</Table.Cell>
        <Table.Cell colSpan='3'>
          {country.modifiers
            .map(key => effectsIR[key]?.name)
            .filter(value => value)
            .join(', ')}
        </Table.Cell>
      </Table.Row>
    </>
  )
}

export default TableRowsSaveCountry
