import React from 'react'
import { Tab } from 'semantic-ui-react'
import ImportSave from 'saves/ImportSave'
import ConvertSave from 'saves/ConvertSave'
import SaveToken from 'saves/SaveToken'

const SaveTool = () => {
  const panes = [
    {
      menuItem: 'Import',
      render: () => <ImportSave />
    },
    {
      menuItem: 'Convert',
      render: () => <ConvertSave />
    }
  ]
  if (process.env.NODE_ENV === 'development') {
    panes.push({
      menuItem: 'Tokenizer',
      render: () => <SaveToken />
    })
  }
  return <Tab panes={panes} defaultActiveIndex={0} />
}

export default SaveTool
