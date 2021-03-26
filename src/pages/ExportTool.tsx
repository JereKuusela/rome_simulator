import React from 'react'
import ExportPops from 'saves/ExportPops'
import FindCharacter from 'saves/FindCharacter'
import { Tab } from 'semantic-ui-react'

const ExportTool = () => {
  const panes = [
    {
      menuItem: 'Pops',
      render: () => <ExportPops />
    },
    {
      menuItem: 'Characters',
      render: () => <FindCharacter />
    }
  ]
  return <Tab panes={panes} defaultActiveIndex={0} />
}

export default ExportTool
