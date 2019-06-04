import { createAction } from 'typesafe-actions'

export const importState = createAction('@@transfer/IMPORT_STATE', action => {
  return (state: any, reset_missing: boolean) => action({ state, reset_missing })
})
