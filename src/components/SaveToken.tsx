import React, { Component } from 'react'
import JSZip from 'jszip'
import { Input, Grid, Header } from 'semantic-ui-react'
import { binaryToPlain, parseFile } from 'managers/importer'

import tokens from 'data/json/ir/binary.json'

type IState = {
  errors: string[]
}

/** Helper for generating save file binary tokens. */
export default class SaveToken extends Component<{}, IState> {

  constructor(props: {}) {
    super(props)
    this.state = { errors: [] }
  }

  plain: File | null = null
  compressed: File | null = null

  render() {
    return (
      <Grid padded>
        <Grid.Row columns='2'>
          <Grid.Column>
            Plain
            <Input type='file' onChange={event => this.loadPlain(event.target.files![0])} />
          </Grid.Column>
          <Grid.Column>
            Compressed
            <Input type='file' onChange={event => this.loadSave(event.target.files![0])} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            {this.state.errors.length ? <Header>Errors:</Header> : null}
            {this.state.errors.map(error => error)}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  loadPlain = (file: File) => {
    this.plain = file
    this.doMapping()
  }

  loadSave = (file: File) => {
    this.compressed = file
    this.doMapping()
  }

  doMapping = () => {
    if (!this.plain || !this.compressed)
      return
    this.plain.text().then(data => {
      const plainFile = parseFile(data)

      new JSZip().loadAsync(this.compressed!).then(zip => {
        zip.file('gamestate')?.async('uint8array').then(buffer => {
          const compressedFile = parseFile(binaryToPlain(buffer, false)[0])

          const mapping: { [key: string]: string } = tokens

          this.mapper(mapping, compressedFile, plainFile)
          const sortedMapping: { [key: string]: string } = {}
          Object.keys(mapping).sort().forEach(key => sortedMapping[key] = mapping[key])
          const blob = new Blob([JSON.stringify(sortedMapping, undefined, 2)], { type: 'text/plain;charset=utf-8' })
          saveAs(blob, 'tokens.json');

          this.plain = null
          this.compressed = null
        })
      })
    })
  }

  mapper = (mapping: { [key: string]: string }, compressed: { [key: string]: any }, plain: { [key: string]: any }) => {
    if (!compressed || !plain)
      return
    // Ironman key doesn't exist on plain save.
    const keys = Object.keys(compressed).filter(key => key !== 'ironman')
    const correctKeys = Object.keys(plain).filter(key => key !== 'ironman')
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const correctKey = correctKeys[i]
      const value = compressed[keys[i]]
      const correctValue = plain[correctKeys[i]]
      if (key !== correctKey)
        mapping[key.substr(2).padStart(4, '0')] = correctKey
      if (typeof value === 'object')
        this.mapper(mapping, value, correctValue)
      else {
        if (typeof value === 'string' && value.startsWith('x_')) {
          if (value !== correctValue)
            mapping[value.substr(2).padStart(4, '0')] = correctValue
        }
        else if (value !== correctValue) {
          console.log(key)
          console.log(value)
          console.log(compressed)
          console.log(correctKey)
          console.log(correctValue)
          console.log(plain)
        }
      }
    }
  }
}
