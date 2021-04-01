export enum ValuesType {
  Base = 'Base',
  Modifier = 'Modifier',
  Gain = 'Gain',
  Loss = 'Loss',
  LossModifier = 'LossModifier'
}

export enum Mode {
  Land = 'Land',
  Naval = 'Naval'
}

export type Data<T extends string> = {
  type: T
  image: string
}
export type DataWithMode<T extends string> = Data<T> & {
  mode?: Mode
}
