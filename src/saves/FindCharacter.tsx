import React, { useCallback, useMemo, useState } from 'react'
import { Dropdown, DropdownProps, Grid, Pagination, PaginationProps, Table } from 'semantic-ui-react'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { loadCharacters, loadCountryList } from './manager'
import { useOptionalState } from 'components/hooks'
import { Save, SaveCharacter } from './types'
import InputImportSave from './InputImportSave'
import TableRowCharacter from './TableRowCharacter'
import { chunk, sum } from 'lodash'
import { traitsIR } from 'data'
import { values } from 'utils'

const paginations = [100, 1000, 10000, 100000]

const VariablePagination = <T extends unknown>({
  items,
  Component
}: {
  items: T[]
  Component: (props: { items: T[] }) => JSX.Element
}) => {
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(paginations[0])

  const handlePaginationChange = (_: unknown, { activePage }: PaginationProps) => setPage(Number(activePage))

  const paginated = useMemo(() => chunk(items, pagination), [items, pagination])
  const shownItems = paginated[page - 1]

  return (
    <>
      <div>
        <Pagination activePage={page} totalPages={paginated.length} onPageChange={handlePaginationChange} />
        <SimpleDropdown values={paginations} value={pagination} onChange={setPagination} />
      </div>
      <Component items={shownItems} />
    </>
  )
}

const TableCharacters = ({ items }: { items: SaveCharacter[] }) => {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Id</Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Country</Table.HeaderCell>
          <Table.HeaderCell>Age</Table.HeaderCell>
          <Table.HeaderCell colSpan='4'>Attributes</Table.HeaderCell>
          <Table.HeaderCell>Traits</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>{items && items.map(item => <TableRowCharacter key={item.id} character={item} />)}</Table.Body>
    </Table>
  )
}

const traitOptions = traitsIR.byIndex().map(item => ({ text: item.name, value: item.key }))

const TraitSelector = ({ onChange }: { onChange: (items: string[]) => void }) => {
  const handleChange = (_: unknown, { value }: DropdownProps) => onChange(value as string[])
  return (
    <Dropdown placeholder='Traits' fluid multiple search selection options={traitOptions} onChange={handleChange} />
  )
}
const FindCharacter = () => {
  const [country, setCountry] = useOptionalState<string>()
  const [save, setSave] = useOptionalState<Save>()
  const [traits, setTraits] = useState<string[]>([])
  const characters = useMemo(() => loadCharacters(save), [save])
  const countries = useMemo(() => loadCountryList(save), [save])

  const filter = useCallback(
    (item: SaveCharacter) => {
      if (country && item.country !== Number(country)) return false
      if (traits.length > 0 && item.traits.every(trait => !traits.includes(trait))) return false
      return true
    },
    [country, traits]
  )

  const sorter = useCallback(
    (a: SaveCharacter, b: SaveCharacter) => {
      const traitsA = a.traits.filter(trait => traits.includes(trait)).length
      const traitsB = b.traits.filter(trait => traits.includes(trait)).length
      const traitDifference = traitsB - traitsA
      if (traitDifference) return traitDifference
      const attributesA = sum(values(a.attributes))
      const attributesB = sum(values(b.attributes))
      const attributesDifference = attributesB - attributesA
      if (attributesDifference) return attributesDifference
      return a.age - b.age
    },
    [traits]
  )

  const filtered = useMemo(() => {
    return characters.filter(filter).sort(sorter)
  }, [characters, filter, sorter])

  return (
    <Grid padded>
      <Grid.Row>
        <Grid.Column verticalAlign='middle'>
          <InputImportSave onImported={setSave} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns='4'>
        <Grid.Column>
          <SimpleDropdown
            value={country ?? ''}
            values={countries}
            search
            onChange={countries.length ? setCountry : undefined}
            placeholder='Select country'
          />
        </Grid.Column>
        <Grid.Column>
          <TraitSelector onChange={setTraits} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <VariablePagination Component={TableCharacters} items={filtered} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default FindCharacter
