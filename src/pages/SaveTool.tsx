import React, { Component } from 'react'
import { Tab } from 'semantic-ui-react'
import ImportSave from 'containers/ImportSave'
import ConvertSave from 'components/ConvertSave'
import SaveToken from 'components/SaveToken'
import ExportPops from 'containers/ExportPops'

export default class SaveTool extends Component {


  render() {
    const panes = [
      {
        menuItem: 'Import',
        render: () => <ImportSave />
      },
      {
        menuItem: 'Convert',
        render: () => <ConvertSave />
      },
      {
        menuItem: 'Export pops',
        render: () => <ExportPops />
      }
    ]
    if (process.env.NODE_ENV === 'development') {
      panes.push({
        menuItem: 'Tokenizer',
        render: () => <SaveToken />
      })
    }
    return (
      <Tab panes={panes} defaultActiveIndex={0} />
    )
  }
}
