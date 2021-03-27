import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Checkbox, Grid, Table } from 'semantic-ui-react'
import { loadCharacters, loadCountryList } from './manager'
import { useBooleanState, useOptionalState } from 'components/hooks'
import { Save, SaveCharacter } from './types'
import TableRowCharacter from './TableRowCharacter'
import { sum } from 'lodash'
import { traitsIR } from 'data'
import { values } from 'utils'
import { InputDelayed } from 'components/Utils/Inputs'
import AttributeImage from 'components/Utils/AttributeImage'
import { CharacterAttribute, filterStatAttributes, Range } from 'types'
import SimpleGridRow from 'components/SimpleGrid'
import SimpleMultiDropdown from 'components/Dropdowns/SimpleMultiDropdown'
import Pagination from 'components/Utils/Pagination'
import TableHeader from 'components/Utils/TableHeader'

const headers = [
  'Id',
  'Name',
  'Country',
  'Gender',
  CharacterAttribute.Age,
  CharacterAttribute.Health,
  CharacterAttribute.Fertility,
  CharacterAttribute.Martial,
  CharacterAttribute.Finesse,
  CharacterAttribute.Charisma,
  CharacterAttribute.Zeal,
  'Traits'
] as const

const sep = ','

const exportCharacter = (item: SaveCharacter) =>
  headers
    .map(header => {
      if (header === 'Id') return item.id
      if (header === 'Country') return item.countryName
      if (header === 'Name') return item.name
      if (header === 'Gender') return item.gender
      if (header === 'Traits') return item.traits.map(key => traitsIR.get(key)?.name).join(' ')
      return item[header]
    })
    .join(sep)

const exportCharacters = (items: SaveCharacter[]) => {
  let data = `sep=${sep}\n${headers.join(sep)}\n`
  data += items.map(exportCharacter).join('\n')
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `characters_${Date.now()}.csv`)
}

const InputRange = ({
  onChange,
  attribute
}: {
  attribute: string
  onChange: (attribute: string, range?: Range) => void
}) => {
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')

  useEffect(() => {
    if (min === '' && max === '') onChange(attribute)
    else
      onChange(attribute, {
        min: min === '' ? -Number.MAX_SAFE_INTEGER : Number(min),
        max: max === '' ? Number.MAX_SAFE_INTEGER : Number(max)
      })
  }, [onChange, attribute, min, max])
  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <AttributeImage attribute={attribute} />
      <InputDelayed value={min} onChange={setMin} style={{ width: 40 }} />
      -
      <InputDelayed value={max} onChange={setMax} style={{ width: 40 }} />
    </div>
  )
}

const verifyValue = (value: number, range?: Range) => {
  if (!range) return true
  return range.min <= value && value <= range.max
}

type FilterSorter = (items: SaveCharacter[]) => SaveCharacter[]

type FiltersProps = {
  save: Save
  onChange: (filterSorter: FilterSorter) => void
}

const emptyArray = [] as never[]

const Filters = ({ save, onChange }: FiltersProps) => {
  const filters = useRef<Record<string, Range | undefined>>({})

  const [countries, setCountries] = useState<string[]>(emptyArray)
  const countryList = useMemo(() => loadCountryList(save), [save])

  const [traits, setTraits] = useState<string[]>(emptyArray)
  const [male, setMale] = useBooleanState(true)
  const [female, setFemale] = useBooleanState(true)
  const [alive, setAlive] = useBooleanState(true)

  const createFilterSorter = useCallback(() => {
    const filterer = (item: SaveCharacter) => {
      if (countries.length > 0 && !countries.includes(String(item.country))) return false
      if (traits.length > 0 && item.traits.every(trait => !traits.includes(trait))) return false

      if (values(CharacterAttribute).some(attribute => !verifyValue(item[attribute], filters.current[attribute])))
        return false
      if (!male && item.gender === 'Male') return false
      if (!female && item.gender === 'Female') return false
      if (alive !== item.alive) return false
      return true
    }
    const sorter = (a: SaveCharacter, b: SaveCharacter) => {
      const traitsA = a.traits.filter(trait => traits.includes(trait)).length
      const traitsB = b.traits.filter(trait => traits.includes(trait)).length
      const traitDifference = traitsB - traitsA
      if (traitDifference) return traitDifference
      const attributesA = sum(values(filterStatAttributes(a)))
      const attributesB = sum(values(filterStatAttributes(b)))
      const attributesDifference = attributesB - attributesA
      if (attributesDifference) return attributesDifference
      return a[CharacterAttribute.Age] - b[CharacterAttribute.Age]
    }
    const filterSorter = (items: SaveCharacter[]) => items.filter(filterer).sort(sorter)
    onChange(filterSorter)
  }, [onChange, countries, traits, male, female, alive])

  useEffect(createFilterSorter, [createFilterSorter])

  const handleChange = useCallback(
    (attribute: string, range?: Range) => {
      filters.current[attribute] = range
      createFilterSorter()
    },
    [createFilterSorter]
  )
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
        <InputRange attribute={CharacterAttribute.Age} onChange={handleChange} />
        <InputRange attribute={CharacterAttribute.Health} onChange={handleChange} />
        <InputRange attribute={CharacterAttribute.Fertility} onChange={handleChange} />
        <InputRange attribute={CharacterAttribute.Martial} onChange={handleChange} />
        <InputRange attribute={CharacterAttribute.Finesse} onChange={handleChange} />
        <InputRange attribute={CharacterAttribute.Zeal} onChange={handleChange} />
        <InputRange attribute={CharacterAttribute.Charisma} onChange={handleChange} />
      </SimpleGridRow>
      <SimpleGridRow>
        <Checkbox label={'Male'} checked={male} onChange={setMale} />
        <Checkbox label={'Female'} checked={female} onChange={setFemale} />
        <Checkbox label={'Alive'} checked={alive} onChange={setAlive} />
        <span />
        <span />
        <span />
        <span />
      </SimpleGridRow>
    </>
  )
}

const TableCharacters = ({ items }: { items: SaveCharacter[] }) => {
  return (
    <Table>
      <TableHeader headers={headers} />
      <Table.Body>
        {items.map(item => (
          <TableRowCharacter key={item.id} character={item} />
        ))}
      </Table.Body>
    </Table>
  )
}

const Characters = ({ items }: { items: SaveCharacter[] }) => {
  return (
    <Grid.Row>
      <Grid.Column>
        <Button primary style={{ float: 'right', height: 42 }} onClick={() => exportCharacters(items)}>
          Export
        </Button>
        <Pagination Component={TableCharacters} items={items} />
      </Grid.Column>
    </Grid.Row>
  )
}

const traitOptions = traitsIR.byIndex().map(item => ({ text: item.name, value: item.key }))

const FindCharacter = ({ save }: { save: Save }) => {
  const characters = useMemo(() => loadCharacters(save), [save])
  const [filterSorter, setFilterSorter] = useOptionalState<FilterSorter>()

  const filtered = useMemo(() => {
    if (characters && filterSorter) return filterSorter(characters)
    return characters
  }, [characters, filterSorter])

  const handleSetFilterSorter = useCallback(
    (filterSorter: FilterSorter) => {
      setFilterSorter((_: unknown) => filterSorter)
    },
    [setFilterSorter]
  )

  return (
    <Grid padded>
      <Filters onChange={handleSetFilterSorter} save={save} />
      <Characters items={filtered} />
    </Grid>
  )
}

export default FindCharacter
