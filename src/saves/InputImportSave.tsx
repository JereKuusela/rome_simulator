import { FileInput } from 'components/Utils/Inputs'
import React, { useState } from 'react'
import { Dimmer, Header, Loader } from 'semantic-ui-react'
import { loadFile, parseFile } from './importer'
import { Save } from './types'

const loadSave = async (file: File) => {
  const [data] = await loadFile(file)
  return data ? (parseFile(data) as Save) : undefined
}

const InputImportSave = ({ onImported }: { onImported: (save: Save) => void }) => {
  const [loading, setLoading] = useState(false)

  const handleFile = async (file: File) => {
    setLoading(true)
    const save = file && (await loadSave(file))
    setLoading(false)
    if (save) onImported(save)
  }

  return (
    <>
      <Dimmer active={loading} page>
        <Loader>Loading</Loader>
      </Dimmer>
      <Header style={{ display: 'inline' }}>Select a save game</Header>
      <FileInput style={{ display: 'inline' }} onChange={handleFile} />
    </>
  )
}

export default InputImportSave
