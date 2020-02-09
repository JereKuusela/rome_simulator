import { TransferState, ExportKeys } from "types"

export const getDefaultTransferState = (): TransferState => ({
  export_keys: {} as ExportKeys,
  reset_missing: false
})
