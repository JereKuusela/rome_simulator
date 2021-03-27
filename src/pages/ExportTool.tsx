import { useOptionalState } from 'components/hooks'
import React from 'react'
import ExportPops from 'saves/ExportPops'
import FindCharacter from 'saves/FindCharacter'
import InputImportSave from 'saves/InputImportSave'
import { Save } from 'saves/types'
import { Tab } from 'semantic-ui-react'

const ExportTool = () => {
  const [save, setSave] = useOptionalState<Save>()
  const panes = save
    ? [
        {
          menuItem: 'Characters',
          render: () => <FindCharacter save={save} />
        },
        {
          menuItem: 'Pops',
          render: () => <ExportPops save={save} />
        }
      ]
    : []

  return (
    <>
      <InputImportSave onImported={setSave} />
      <Tab panes={panes} defaultActiveIndex={0} />
    </>
  )
}

export default ExportTool
