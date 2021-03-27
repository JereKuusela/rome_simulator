import React, { useEffect } from 'react'
import { Save, SaveCountry } from './types'
import { Grid } from 'semantic-ui-react'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { forEach, toArr } from 'utils'
import {
  getCategoryName,
  getTagName,
  getTerritoryName,
  loadCountry,
  loadCountryList,
  loadPopsByTerritory
} from 'saves/manager'
import { useOptionalState } from 'components/hooks'

const exportPops = (save: Save, id: number) => {
  const name = getTagName(save.country?.country_database[Number(id)].tag ?? '')

  const territories = loadPopsByTerritory(save, Number(id))
  const total: { [key: string]: number } = {}
  territories.forEach(territory =>
    forEach(territory.pops, (amount, category) => {
      total[category] = (total[category] ?? 0) + amount
    })
  )
  const sorted = toArr(total, (amount, category: string) => ({ amount, category })).sort((a, b) => b.amount - a.amount)
  const categories = sorted.map(item => item.category)
  let data = 'sep=,\n,Rank,'
  data += categories.map(getCategoryName).join(',') + '\n'
  territories.forEach(territory => {
    data += `${getTerritoryName(territory.name)} (${territory.id}),${territory.rank},`
    const counts = categories.map(category => territory.pops[category] ?? 0)
    data += counts.join(',') + '\n'
  })
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, `pops_${name}_${Date.now()}.csv`)
}

const ExportPops = ({ save }: { save: Save }) => {
  const [country, setCountry] = useOptionalState<SaveCountry>()
  const countries = loadCountryList(save)

  useEffect(() => {
    if (save && country) exportPops(save, country.id)
  }, [save, country])

  const selectCountry = (save: Save, id: number) => {
    setCountry(loadCountry(save, id))
  }

  const handleChangeCountry = (id: string) => {
    if (!save) return
    selectCountry(save, Number(id))
  }

  return (
    <Grid padded>
      <Grid.Row columns='4'>
        <Grid.Column>
          <SimpleDropdown
            value={String(country?.id ?? '')}
            values={countries}
            search
            onChange={countries.length ? handleChangeCountry : undefined}
            placeholder='Select country'
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default ExportPops
