import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Checkbox, Grid, Pagination, PaginationProps, Table } from 'semantic-ui-react'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { loadCharacters, loadCountryList } from './manager'
import { useBooleanState, useOptionalState } from 'components/hooks'
import { Save, SaveCharacter } from './types'
import InputImportSave from './InputImportSave'
import TableRowCharacter from './TableRowCharacter'
import { chunk, sum } from 'lodash'
import { traitsIR } from 'data'
import { values } from 'utils'
import Input from 'components/Utils/Input'
import AttributeImage from 'components/Utils/AttributeImage'
import { GeneralAttribute, Range } from 'types'
import SimpleGridRow from 'components/SimpleGrid'
import SimpleMultiDropdown from 'components/Dropdowns/SimpleMultiDropdown'

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

const InputRange = ({
  onChange,
  attribute
}: {
  attribute: string
  onChange: (attribute: string, range?: Range) => void
}) => {
  const onChangeRef = useRef(onChange)
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')

  useEffect(() => {
    if (min === '' && max === '') onChangeRef.current(attribute)
    else
      onChangeRef.current(attribute, {
        min: min === '' ? -Number.MAX_SAFE_INTEGER : Number(min),
        max: max === '' ? Number.MAX_SAFE_INTEGER : Number(max)
      })
  }, [attribute, min, max])
  return (
    <div>
      <AttributeImage attribute={attribute} />
      <Input value={min} onChange={setMin} style={{ width: 40 }} />
      -
      <Input value={max} onChange={setMax} style={{ width: 40 }} />
    </div>
  )
}

const verifyValue = (value: number, range?: Range) => {
  if (!range) return true
  return range.min <= value && value <= range.max
}

type FilterSorter = (items: SaveCharacter[]) => SaveCharacter[]

type FiltersProps = {
  save?: Save
  onChange: (filterSorter: FilterSorter) => void
}

const Filters = ({ save, onChange }: FiltersProps) => {
  const onChangeRef = useRef(onChange)
  const filters = useRef<Record<string, Range | undefined>>({})

  const [countries, setCountries] = useState<string[]>([])
  const countryList = useMemo(() => loadCountryList(save), [save])

  const [traits, setTraits] = useState<string[]>([])
  const [male, setMale] = useBooleanState(true)
  const [female, setFemale] = useBooleanState(true)

  const createFilterSorter = useCallback(() => {
    const filter = (item: SaveCharacter) => {
      if (countries.length > 0 && !countries.includes(String(item.country))) return false
      if (traits.length > 0 && item.traits.every(trait => !traits.includes(trait))) return false

      if (
        values(GeneralAttribute).some(attribute => !verifyValue(item.attributes[attribute], filters.current[attribute]))
      )
        return false
      if (!verifyValue(item.age, filters.current['Age'])) return false
      if (!male && item.gender === 'Male') return false
      if (!female && item.gender === 'Female') return false
      return true
    }
    const sorter = (a: SaveCharacter, b: SaveCharacter) => {
      const traitsA = a.traits.filter(trait => traits.includes(trait)).length
      const traitsB = b.traits.filter(trait => traits.includes(trait)).length
      const traitDifference = traitsB - traitsA
      if (traitDifference) return traitDifference
      const attributesA = sum(values(a.attributes))
      const attributesB = sum(values(b.attributes))
      const attributesDifference = attributesB - attributesA
      if (attributesDifference) return attributesDifference
      return a.age - b.age
    }
    const filterSorter = (items: SaveCharacter[]) => items.filter(filter).sort(sorter)
    onChangeRef.current(filterSorter)
  }, [countries, traits, male, female])

  useEffect(createFilterSorter, [createFilterSorter])

  const handleChange = (attribute: string, range?: Range) => {
    filters.current[attribute] = range
    createFilterSorter()
  }
  return (
    <>
      <SimpleGridRow>
        <SimpleMultiDropdown
          value={countries}
          values={countryList}
          search
          onChange={setCountries}
          placeholder='Countries'
        />
        <SimpleMultiDropdown value={traits} values={traitOptions} search onChange={setTraits} placeholder='Traits' />
      </SimpleGridRow>
      <SimpleGridRow>
        <InputRange attribute={GeneralAttribute.Martial} onChange={handleChange} />
        <InputRange attribute={GeneralAttribute.Finesse} onChange={handleChange} />
        <InputRange attribute={GeneralAttribute.Zeal} onChange={handleChange} />
        <InputRange attribute={GeneralAttribute.Charisma} onChange={handleChange} />
        <InputRange attribute={'Age'} onChange={handleChange} />
        <Checkbox label={'Male'} checked={male} onChange={setMale} />
        <Checkbox label={'Female'} checked={female} onChange={setFemale} />
      </SimpleGridRow>
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
          <Table.HeaderCell>Gender</Table.HeaderCell>
          <Table.HeaderCell colSpan='4'>Attributes</Table.HeaderCell>
          <Table.HeaderCell>Traits</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>{items && items.map(item => <TableRowCharacter key={item.id} character={item} />)}</Table.Body>
    </Table>
  )
}

const traitOptions = traitsIR.byIndex().map(item => ({ text: item.name, value: item.key }))

const FindCharacter = () => {
  const [save, setSave] = useOptionalState<Save>()
  const characters = useMemo(() => loadCharacters(save), [save])
  const [filterSorter, setFilterSorter] = useOptionalState<FilterSorter>()

  const filtered = useMemo(() => {
    if (characters && filterSorter) return filterSorter(characters)
    return characters
  }, [characters, filterSorter])

  const handleSetFilterSorter = (filterSorter: FilterSorter) => {
    setFilterSorter((_: unknown) => filterSorter)
  }

  return (
    <Grid padded>
      <Grid.Row>
        <Grid.Column verticalAlign='middle'>
          <InputImportSave onImported={setSave} />
        </Grid.Column>
      </Grid.Row>
      <Filters onChange={handleSetFilterSorter} save={save} />
      <Grid.Row>
        <Grid.Column>
          <VariablePagination Component={TableCharacters} items={filtered} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default FindCharacter
