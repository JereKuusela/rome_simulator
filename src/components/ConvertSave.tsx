import React, { Component } from 'react'
import JSZip from 'jszip'
import { Input, Grid, Header } from 'semantic-ui-react'
import { binaryToPlain } from 'managers/importer'

type IState = {
  errors: string[]
}

/** Converts a compressed binary save to plain text. */
export default class ConvertSave extends Component<{}, IState> {

  constructor(props: {}) {
    super(props)
    this.state = { errors: [] }
  }

  render() {
    return (
      <Grid padded>
        <Grid.Row columns='2'>
          <Grid.Column verticalAlign='middle'>
            <Header>Select a save game to decompress:</Header>
          </Grid.Column>
          <Grid.Column>
            <Input type='file' onChange={event => this.loadSave(event.target.files![0])} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            {this.state.errors.length ? <Header>Errors:</Header> : null}
            {this.state.errors.map((error, index) => <p key={index}>{error}</p>)}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  loadSave = async (file: File) => {
    new JSZip().loadAsync(file).then(zip => {
      const unzipped = zip.file('gamestate')
      if (unzipped) {
        unzipped.async('uint8array').then(buffer => {
          const [data, errors] = binaryToPlain(buffer, true)
          this.setState({ errors })
          const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
          saveAs(blob, 'plain_' + file.name)
        })
      }
      else {
        this.setState({ errors: ['File is not save file.'] })
      }

    }).catch(() => {
      this.setState({ errors: ['File is not a compressed save file.'] })
    })
  }
}
