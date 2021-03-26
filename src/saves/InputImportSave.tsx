import { FileInput } from 'components/Utils/Input'
import React from 'react'
import { Header } from 'semantic-ui-react'
import { loadFile, parseFile } from './importer'
import { Save } from './types'

const loadSave = async (file: File) => {
  const [data] = await loadFile(file)
  return data ? (parseFile(data) as Save) : undefined
}

const InputImportSave = ({ onImported }: { onImported: (save: Save) => void }) => {
  const handleFile = async (file: File) => {
    const save = file && (await loadSave(file))
    if (save) onImported(save)
  }

  return (
    <>
      <Header style={{ display: 'inline' }}>Select a save game</Header>
      <FileInput style={{ display: 'inline' }} onChange={handleFile} />
    </>
  )
}

export default InputImportSave
