import EmptyIcon from './images/empty.png'
import UnknownIcon from './images/unknown.png'

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
  mode: DefinitionType
}

/**
 * Returns the image of a definition while handling missing cases.
 * Question mark is returned for existing definitions without an image.
 * Empty is returned for non-existing definitions.
 * @param definition
 */
export const getImage = (definition: { image?: string } | null): string => (definition && definition.image) || (definition ? UnknownIcon : EmptyIcon)
