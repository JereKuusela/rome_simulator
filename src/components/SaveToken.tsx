import React, { Component } from 'react'
import JSZip from 'jszip'
import { Input, Grid, Header } from 'semantic-ui-react'
import { binaryToPlain, parseFile } from 'managers/importer'

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
            <Input type='file' onChange={event => this.loadPlain(event.target.files![0])} />
          </Grid.Column>
          <Grid.Column>
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

          const mapping: { [key: string]: string } = {}
          this.mapper(mapping, compressedFile, plainFile)
          const blob = new Blob([JSON.stringify(mapping, undefined, 2)], { type: 'text/plain;charset=utf-8' })
          saveAs(blob, 'tokens.json');

          this.plain = null
          this.compressed = null
        })
      })
    })
  }

  mapper = (mapping: { [key: string]: string }, compressed: { [key: string]: any }, plain: { [key: string]: any }) => {
    const keys = Object.keys(compressed)
    const correctKeys = Object.keys(plain)
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== correctKeys[i])
        mapping[keys[i].substr(2).padStart(4, '0')] = correctKeys[i]
      if (typeof compressed[keys[i]] === 'object')
        this.mapper(mapping, compressed[keys[i]], plain[correctKeys[i]])
      else if (typeof compressed[keys[i]] === 'string' && compressed[keys[i]].startsWith('x_')) {
        if (compressed[keys[i]] !== plain[correctKeys[i]])
          mapping[compressed[keys[i]].substr(2).padStart(4, '0')] = plain[correctKeys[i]]
      }
    }
  }
}
