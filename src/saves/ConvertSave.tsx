import React, { useState } from 'react'
import { Grid, Header } from 'semantic-ui-react'
import { loadFile } from './importer'
import { FileInput } from '../components/Utils/Inputs'

/** Converts a compressed binary save to plain text. */
const ConvertSave = () => {
  const [errors, setErrors] = useState<string[]>([])
  const loadSave = async (file: File) => {
    const [data, errors] = await loadFile(file)
    setErrors(errors)
    if (data) {
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
      saveAs(blob, 'plain_' + file.name)
    }
  }

  return (
    <Grid padded>
      <Grid.Row columns='2'>
        <Grid.Column verticalAlign='middle'>
          <Header>Select a save game to decompress</Header>
          Experimental tool that let's you turn save games into plain text and inspect them with a text editor. Playing
          these saves is not recommended.
        </Grid.Column>
        <Grid.Column>
          <FileInput onChange={loadSave} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          {errors.length ? <Header>Errors:</Header> : null}
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default ConvertSave
