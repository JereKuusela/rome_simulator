import { TransferState, ExportKeys } from 'types'

export const getDefaultTransferState = (): TransferState => ({
  exportKeys: {} as ExportKeys,
  resetMissing: false
})
