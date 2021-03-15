import React, { Component } from 'react'
import JSZip from 'jszip'
import { Grid, Header } from 'semantic-ui-react'
import { binaryToPlain } from 'managers/importer'
import { FileInput } from './Utils/Input'

type IState = {
  errors: string[]
}

/** Converts a compressed binary save to plain text. */
export default class ConvertSave extends Component<unknown, IState> {
  constructor(props: unknown) {
    super(props)
    this.state = { errors: [] }
  }

  render() {
    return (
      <Grid padded>
        <Grid.Row columns='2'>
          <Grid.Column verticalAlign='middle'>
            <Header>Select a save game to decompress</Header>
            Experimental tool that let's you turn save games into plain text and inspect them with a text editor.
            Playing these saves is not recommended.
          </Grid.Column>
          <Grid.Column>
            <FileInput onChange={this.loadSave} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            {this.state.errors.length ? <Header>Errors:</Header> : null}
            {this.state.errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  loadSave = async (file: File) => {
    new JSZip()
      .loadAsync(file)
      .then(zip => {
        const unzipped = zip.file('gamestate')
        if (unzipped) {
          unzipped.async('uint8array').then(buffer => {
            const [data, errors] = binaryToPlain(buffer, true)
            this.setState({ errors })
            const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
            saveAs(blob, 'plain_' + file.name)
          })
        } else {
          this.setState({ errors: ['File is not save file.'] })
        }
      })
      .catch(() => {
        this.setState({ errors: ['File is not a compressed save file.'] })
      })
  }
}
