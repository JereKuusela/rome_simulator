import React, { Component } from 'react'
import { Save } from 'types'
import { Input, Grid, Header } from 'semantic-ui-react'
import SimpleDropdown from 'components/Dropdowns/SimpleDropdown'
import { countriesIR, culturesIR, territoriesIR } from 'data'
import { forEach, keys, toArr } from 'utils'
import { parseFile, binaryToPlain } from 'managers/importer'
import JSZip from 'jszip'
import { getFirstPlayedCountry, loadPopsByTerritory } from 'managers/saves'

type IState = {
  country: string | number | null
  file: Save
}

export default class ExportPops extends Component<{}, IState> {

  constructor(props: {}) {
    super(props)
    this.state = { country: null, file: {} as Save }
  }

  getTagName = (tag: string) => countriesIR[tag.toLowerCase()] ? countriesIR[tag.toLowerCase()] + ' (' + tag + ')' : tag
  getTerritoryName = (name: string) => territoriesIR[name.toLowerCase()] ? territoriesIR[name.toLowerCase()] : name
  getCategoryName = (name: string) => {
    const split = name.split(' ')
    const rawCulture = split[0].toLowerCase()
    const culture = culturesIR[rawCulture] ?? rawCulture
    if (split.length > 1)
      return `${culture} ${split[1]}`
    return culture
  }

  render() {
    const { country } = this.state
    const countries = this.getCountryList()
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column verticalAlign='middle'>
            <Header style={{ display: 'inline' }} >Select a save game to import</Header>
            <Input style={{ display: 'inline' }} type='file' onChange={event => this.loadContent(event.target.files![0])} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns='4'>
          <Grid.Column>
            <SimpleDropdown
              value={String(country ?? '')}
              values={countries}
              clearable search
              onChange={countries.length ? this.selectCountry : undefined}
              placeholder='Select country'
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  selectCountry = (country: string) => this.setState({ country }, () => this.exportPops())


  exportPops = () => {
    if (!this.state.country)
      return
    const name = this.getTagName(this.state.file.country?.country_database[Number(this.state.country)].tag ?? '')

    const territories = loadPopsByTerritory(this.state.file, Number(this.state.country))
    const total: { [key: string]: number } = {}
    territories.forEach(territory => forEach(territory.pops, (amount, category) => {
      total[category] = (total[category] ?? 0) + amount
    }))
    const sorted = toArr(total, (amount, category) => ({ amount, category })).sort((a, b) => b.amount - a.amount)
    const categories = sorted.map(item => item.category)
    let data = ',Rank,'
    data += categories.map(this.getCategoryName).join(',') + '\n'
    territories.forEach(territory => {
      data += `${this.getTerritoryName(territory.name)} (${territory.id}),${territory.rank},`
      const counts = categories.map(category => territory.pops[category] ?? 0)
      data += counts.join(',') + '\n'
    })
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, `pops_${name}_${Date.now()}.csv`)
  }

  loadContent = (file: File) => {
    if (!file) {
      this.setState({ country: null, file: {} as Save })
      return
    }
    new JSZip().loadAsync(file).then(zip => {
      const file = zip.file('gamestate')
      if (file) {
        file.async('uint8array').then(buffer => {
          const file = parseFile(binaryToPlain(buffer, false)[0]) as Save
          const firstPlayer = getFirstPlayedCountry(file);
          this.setState({ file }, () => this.selectCountry(String(firstPlayer)))
        })
      }
    }).catch(() => {
      file.text().then(data => {
        const file = parseFile(data) as Save
        this.setState({ file })
      })
    })
  }

  getCountryList = () => {
    const data = this.state.file.country?.country_database
    if (data) {
      return keys(data).map(key => ({ text: this.getTagName(data[Number(key)].tag), value: key }))
    }
    return []
  }
}

