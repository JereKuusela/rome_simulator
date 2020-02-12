
export enum ValuesType {
  Base = 'Base',
  Modifier = 'Modifier',
  Loss = 'Loss',
  LossModifier = 'LossModifier'
}

export enum DefinitionType {
  Land = 'Land',
  Naval = 'Naval',
  Global = 'Global'
}

export type Mode = DefinitionType.Land | DefinitionType.Naval

export interface Definition<T extends string> {
  type: T
  image: string
  mode?: DefinitionType
}
