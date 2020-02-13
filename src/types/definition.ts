
export enum ValuesType {
  Base = 'Base',
  Modifier = 'Modifier',
  Loss = 'Loss',
  LossModifier = 'LossModifier'
}

export enum Mode {
  Land = 'Land',
  Naval = 'Naval'
}

export interface Definition<T extends string> {
  type: T
  image: string
  mode?: Mode
}
