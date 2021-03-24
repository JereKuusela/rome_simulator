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
import { toPercent } from 'formatters'
import React from 'react'
import { Table } from 'semantic-ui-react'
import { Country, CountryAttribute } from 'types'
import { Tech } from 'types/generated'
import { countTech } from './manager'
import { SaveCountry } from './types'

const TableRowsSaveCountry = ({ saveCountry, country }: { saveCountry?: SaveCountry; country?: Country }) => {
  if (!saveCountry || !country) return null
  return (
    <>
      <Table.Row>
        <Table.Cell>Country</Table.Cell>
        <Table.Cell>{saveCountry.name}</Table.Cell>
        <Table.Cell>Controller</Table.Cell>
        <Table.Cell>{saveCountry.isPlayer ? 'Player' : 'AI'}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Civic tech</Table.Cell>
        <Table.Cell>
          Level {saveCountry.civicTech} with {countTech(saveCountry, Tech.Civic)}
        </Table.Cell>
        <Table.Cell>Martial tech</Table.Cell>
        <Table.Cell>
          Level {saveCountry.martialTech} with {countTech(saveCountry, Tech.Martial)}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Oratory tech</Table.Cell>
        <Table.Cell>
          Level {saveCountry.oratoryTech} with {countTech(saveCountry, Tech.Oratory)}
        </Table.Cell>
        <Table.Cell>Religious tech</Table.Cell>
        <Table.Cell>
          Level {saveCountry.religiousTech} with {countTech(saveCountry, Tech.Religious)}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Culture</Table.Cell>
        <Table.Cell>{culturesIR[saveCountry.culture].name}</Table.Cell>
        <Table.Cell>Heritage</Table.Cell>
        <Table.Cell>{heritagesIR.getName(saveCountry.heritage)}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Army</Table.Cell>
        <Table.Cell>{policiesIR.getName(saveCountry.armyMaintenance)}</Table.Cell>
        <Table.Cell>Navy</Table.Cell>
        <Table.Cell>{policiesIR.getName(saveCountry.navalMaintenance)}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Levy Multiplier</Table.Cell>
        <Table.Cell>{toPercent(country[CountryAttribute.LevySize])}</Table.Cell>
        <Table.Cell />
        <Table.Cell />
      </Table.Row>
      <Table.Row>
        <Table.Cell>Military experience</Table.Cell>
        <Table.Cell>{saveCountry.militaryExperience}</Table.Cell>
        <Table.Cell>Traditions</Table.Cell>
        <Table.Cell>{saveCountry.traditions.length}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Capital surplus</Table.Cell>
        <Table.Cell>{tradesIR.getName(saveCountry.surplus).join(', ')}</Table.Cell>
        <Table.Cell>Ideas</Table.Cell>
        <Table.Cell>{ideasIR.getName(saveCountry.ideas).join(', ')}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Laws</Table.Cell>
        <Table.Cell colSpan='3'>{lawsIR.getName(saveCountry.laws).join(', ')}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Government</Table.Cell>
        <Table.Cell>{saveCountry.government}</Table.Cell>
        <Table.Cell>Faction</Table.Cell>
        <Table.Cell>{factionsIR.getName(saveCountry.faction)}</Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Religion</Table.Cell>
        <Table.Cell>
          {religionsIR.getName(saveCountry.religion)} ({saveCountry.religiousUnity.toPrecision(3)}%)
        </Table.Cell>
        <Table.Cell>Deities</Table.Cell>
        <Table.Cell>
          {deitiesIR
            .get(saveCountry.deities)
            .map(item => item.name + (saveCountry.omen.substr(4) === item.key.substr(5) ? ' (with omen)' : ''))
            .join(', ')}
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>Modifiers</Table.Cell>
        <Table.Cell colSpan='3'>{effectsIR.getName(saveCountry.modifiers).join(', ')}</Table.Cell>
      </Table.Row>
    </>
  )
}

export default TableRowsSaveCountry
