import { DefinitionType } from 'types'
import { mergeValues, addValues, ValuesType, clearAllValues, clearValues, regenerateValues, calculateValue, calculateValueWithoutLoss, calculateBase, calculateModifier, calculateLoss, explainShort, getValue, BaseDefinitionValues } from 'definition_values'
import EmptyIcon from 'images/empty.png'
import UnknownIcon from 'images/unknown.png'
import { size } from 'lodash'
import { strengthToValue } from 'formatters'
import { getImage } from 'utils'

type Values = { [key: string]: { [key: string]: number } }
type BD = BaseDefinitionValues<any>

describe('getImage', () => {
  it('returns image', () => {
    const definition = { image: 'test' }
    const result = getImage(definition)
    expect(result).toEqual('test')
  })
  it('returns unknown', () => {
    const definition = { image: undefined }
    const result = getImage(definition)
    expect(result).toEqual(UnknownIcon)
  })
  it('returns empty', () => {
    const result = getImage(null)
    expect(result).toEqual(EmptyIcon)
  })
})

const initValues = (attribute: string, key: string, value: number) => (
  { [attribute]: { [key]: value } }
)

const get = (value1?: number, value2?: number): Values => {
  if (value1 !== undefined && value2 !== undefined)
    return { 'attribute': { 'key1': value1, 'key2': value2 } }
  if (value1 !== undefined)
    return { 'attribute': { 'key1': value1 } }
  return { 'attribute': {} }
}

const initDefinition = (value1: number | undefined, value2: number | undefined, value3: number | undefined, value4: number | undefined) => (
  { type: 'test', image: '', base_values: get(value1), modifier_values: get(value2), loss_values: get(value3), loss_modifier_values: get(value4) }
)

const initBase = (value1: number, value2?: number) => (
  { type: 'test', image: '', base_values: get(value1, value2) }
)

const initModifier = (value1: number, value2?: number) => (
  { type: 'test', image: '', modifier_values: get(value1, value2) }
)

const initLoss = (value1: number, value2?: number) => (
  { type: 'test', image: '', loss_values: get(value1, value2) }
)

const initLossModifier = (value1: number, value2?: number) => (
  { type: 'test', image: '', loss_modifier_values: get(value1, value2) }
)

describe('mergeValues', () => {
  it('returns first when only', () => {
    const result = mergeValues({ type: 'test' } as BD, undefined) as any
    expect(result.type).toEqual('test')
  })
  it('returns second when only', () => {
    const result = mergeValues(undefined, { type: 'test' } as BD) as any
    expect(result.type).toEqual('test')
  })
  it('returns first when both', () => {
    const result = mergeValues({ type: 'test1' } as BD, { type: 'test2' } as BD) as any
    expect(result.type).toEqual('test1')
  })
  it('generates empty values', () => {
    const definition = { type: 'test', image: '', base_values: undefined, modifier_values: undefined, loss_values: undefined, loss_modifier_values: undefined }
    const result = mergeValues(definition, undefined) as any
    expect(result.base_values).toBeTruthy()
    expect(result.modifier_values).toBeTruthy()
    expect(result.loss_values).toBeTruthy()
    expect(result.loss_modifier_values).toBeTruthy()
  })
  it('merges different values', () => {
    const definition = { type: 'test', image: '', base_values: initValues('test1', 'key1', 0), modifier_values: initValues('test1', 'key2', 0), loss_values: initValues('test1', 'key3', 0), loss_modifier_values: initValues('test1', 'key4', 0) }
    const toMerge = { type: 'test', image: '', base_values: initValues('test2', 'key1', 0), modifier_values: initValues('test2', 'key2', 0), loss_values: initValues('test2', 'key3', 0), loss_modifier_values: initValues('test2', 'key4', 0) }
    const result = mergeValues(definition, toMerge)
    expect(size(result.base_values)).toEqual(2)
    expect(size(result.modifier_values)).toEqual(2)
    expect(size(result.loss_values)).toEqual(2)
    expect(size(result.base_values['test1'])).toEqual(1)
    expect(size(result.modifier_values['test1'])).toEqual(1)
    expect(size(result.loss_values['test1'])).toEqual(1)
    expect(size(result.base_values['test2'])).toEqual(1)
    expect(size(result.modifier_values['test2'])).toEqual(1)
    expect(size(result.loss_values['test2'])).toEqual(1)
    expect(size(result.loss_modifier_values['test2'])).toEqual(1)
  })
  it('merges same values', () => {
    const result = mergeValues(initDefinition(0, 0, 0, 0), initDefinition(1, 2, 3, 4))
    expect(size(result.base_values['attribute'])).toEqual(1)
    expect(size(result.modifier_values['attribute'])).toEqual(1)
    expect(size(result.loss_values['attribute'])).toEqual(1)
    expect(size(result.loss_modifier_values['attribute'])).toEqual(1)
    expect(result.base_values['attribute']['key1']).toEqual(1)
    expect(result.modifier_values['attribute']['key1']).toEqual(2)
    expect(result.loss_values['attribute']['key1']).toEqual(3)
    expect(result.loss_modifier_values['attribute']['key1']).toEqual(4)
  })
})

describe('addValues', () => {
  it('generates empty base values', () => {
    const result = addValues({ type: 'test', image: '', base_values: undefined }, ValuesType.Base, 'key1', [])
    expect(result.base_values).toBeTruthy
  })
  it('generates empty modifier values', () => {
    const result = addValues({ type: 'test', image: '', modifier_values: undefined }, ValuesType.Modifier, 'key1', [])
    expect(result.modifier_values).toBeTruthy
  })
  it('generates empty loss values', () => {
    const result = addValues({ type: 'test', image: '', loss_values: undefined }, ValuesType.Loss, 'key1', [])
    expect(result.loss_values).toBeTruthy
  })
  it('generates empty loss modifier values', () => {
    const result = addValues({ type: 'test', image: '', loss_modifier_values: undefined }, ValuesType.LossModifier, 'key1', [])
    expect(result.loss_modifier_values).toBeTruthy
  })
  it('adds to base values', () => {
    const result = addValues(initBase(0), ValuesType.Base, 'key2', [['attribute', 1]])
    expect(size(result.base_values)).toEqual(1)
    expect(size(result.base_values['attribute'])).toEqual(2)
    expect(result.base_values['attribute']['key1']).toEqual(0)
    expect(result.base_values['attribute']['key2']).toEqual(1)
  })
  it('adds to modifier values', () => {
    const result = addValues(initModifier(0), ValuesType.Modifier, 'key2', [['attribute', 1]])
    expect(size(result.modifier_values)).toEqual(1)
    expect(size(result.modifier_values['attribute'])).toEqual(2)
    expect(result.modifier_values['attribute']['key1']).toEqual(0)
    expect(result.modifier_values['attribute']['key2']).toEqual(1)
  })
  it('adds to loss values', () => {
    const result = addValues(initLoss(0), ValuesType.Loss, 'key2', [['attribute', 1]])
    expect(size(result.loss_values)).toEqual(1)
    expect(size(result.loss_values['attribute'])).toEqual(2)
    expect(result.loss_values['attribute']['key1']).toEqual(0)
    expect(result.loss_values['attribute']['key2']).toEqual(1)
  })
  it('adds to loss modifier values', () => {
    const result = addValues(initLossModifier(0), ValuesType.LossModifier, 'key2', [['attribute', 1]])
    expect(size(result.loss_modifier_values)).toEqual(1)
    expect(size(result.loss_modifier_values['attribute'])).toEqual(2)
    expect(result.loss_modifier_values['attribute']['key1']).toEqual(0)
    expect(result.loss_modifier_values['attribute']['key2']).toEqual(1)
  })
  it('merges to base values', () => {
    const result = addValues(initBase(0), ValuesType.Base, 'key1', [['attribute', 1]])
    expect(size(result.base_values)).toEqual(1)
    expect(size(result.base_values['attribute'])).toEqual(1)
    expect(result.base_values['attribute']['key1']).toEqual(1)
  })
  it('merges to modifier values', () => {
    const result = addValues(initModifier(0), ValuesType.Modifier, 'key1', [['attribute', 1]])
    expect(size(result.modifier_values)).toEqual(1)
    expect(size(result.modifier_values['attribute'])).toEqual(1)
    expect(result.modifier_values['attribute']['key1']).toEqual(1)
  })
  it('merges to loss values', () => {
    const result = addValues(initLoss(0), ValuesType.Loss, 'key1', [['attribute', 1]])
    expect(size(result.loss_values)).toEqual(1)
    expect(size(result.loss_values['attribute'])).toEqual(1)
    expect(result.loss_values['attribute']['key1']).toEqual(1)
  })
  it('merges to loss modifier values', () => {
    const result = addValues(initLossModifier(0), ValuesType.LossModifier, 'key1', [['attribute', 1]])
    expect(size(result.loss_modifier_values)).toEqual(1)
    expect(size(result.loss_modifier_values['attribute'])).toEqual(1)
    expect(result.loss_modifier_values['attribute']['key1']).toEqual(1)
  })
})

describe('clearAllValues', () => {
  it('resets empty values', () => {
    const result = clearAllValues({ type: 'test', image: '', base_values: undefined, modifier_values: undefined, loss_values: undefined, loss_modifier_values: undefined }, 'key1')
    expect(result.base_values).toBeTruthy
    expect(result.modifier_values).toBeTruthy
    expect(result.loss_values).toBeTruthy
    expect(result.loss_modifier_values).toBeTruthy
  })
  it('clears all values', () => {
    const result = clearAllValues(initDefinition(0, 0, 0, 0), 'key1')
    expect(size(result.base_values)).toEqual(1)
    expect(size(result.base_values['attribute'])).toEqual(0)
    expect(size(result.modifier_values)).toEqual(1)
    expect(size(result.modifier_values['attribute'])).toEqual(0)
    expect(size(result.loss_values)).toEqual(1)
    expect(size(result.loss_values['attribute'])).toEqual(0)
    expect(size(result.loss_modifier_values)).toEqual(1)
    expect(size(result.loss_modifier_values['attribute'])).toEqual(0)
  })
  it('leaves other values', () => {
    const result = clearAllValues(initDefinition(0, 0, 0, 0), 'key2')
    expect(size(result.base_values)).toEqual(1)
    expect(size(result.base_values['attribute'])).toEqual(1)
    expect(size(result.modifier_values)).toEqual(1)
    expect(size(result.modifier_values['attribute'])).toEqual(1)
    expect(size(result.loss_values)).toEqual(1)
    expect(size(result.loss_values['attribute'])).toEqual(1)
    expect(size(result.loss_modifier_values)).toEqual(1)
    expect(size(result.loss_modifier_values['attribute'])).toEqual(1)
  })
})

describe('clearValues', () => {
  it('clears base values', () => {
    const result = clearValues(initDefinition(0, 0, 0, 0), ValuesType.Base, 'key1')
    expect(size(result.base_values['attribute'])).toEqual(0)
    expect(size(result.modifier_values['attribute'])).toEqual(1)
    expect(size(result.loss_values['attribute'])).toEqual(1)
    expect(size(result.loss_modifier_values['attribute'])).toEqual(1)
  })
  it('clears modifier values', () => {
    const result = clearValues(initDefinition(0, 0, 0, 0), ValuesType.Modifier, 'key1')
    expect(size(result.base_values['attribute'])).toEqual(1)
    expect(size(result.modifier_values['attribute'])).toEqual(0)
    expect(size(result.loss_values['attribute'])).toEqual(1)
    expect(size(result.loss_modifier_values['attribute'])).toEqual(1)
  })
  it('clears loss values', () => {
    const result = clearValues(initDefinition(0, 0, 0, 0), ValuesType.Loss, 'key1')
    expect(size(result.base_values['attribute'])).toEqual(1)
    expect(size(result.modifier_values['attribute'])).toEqual(1)
    expect(size(result.loss_values['attribute'])).toEqual(0)
    expect(size(result.loss_modifier_values['attribute'])).toEqual(1)
  })
  it('clears loss modifier values', () => {
    const result = clearValues(initDefinition(0, 0, 0, 0), ValuesType.LossModifier, 'key1')
    expect(size(result.base_values['attribute'])).toEqual(1)
    expect(size(result.modifier_values['attribute'])).toEqual(1)
    expect(size(result.loss_values['attribute'])).toEqual(1)
    expect(size(result.loss_modifier_values['attribute'])).toEqual(0)
  })
})

describe('regenerateValues', () => {
  it('regenerates base values', () => {
    const result = regenerateValues(initDefinition(0, 0, 0, 0), ValuesType.Base, 'key1', [['attribute2', 1]])
    expect(size(result.base_values['attribute'])).toEqual(0)
    expect(size(result.base_values['attribute2'])).toEqual(1)
    expect(size(result.modifier_values['attribute'])).toEqual(1)
    expect(result.modifier_values['attribute2']).toBeUndefined()
    expect(size(result.loss_values['attribute'])).toEqual(1)
    expect(result.loss_values['attribute2']).toBeUndefined()
    expect(size(result.loss_modifier_values['attribute'])).toEqual(1)
    expect(result.loss_modifier_values['attribute2']).toBeUndefined()
  })
  it('regenerates modifier values', () => {
    const result = regenerateValues(initDefinition(0, 0, 0, 0), ValuesType.Modifier, 'key1', [['attribute2', 1]])
    expect(size(result.base_values['attribute'])).toEqual(1)
    expect(result.base_values['attribute2']).toBeUndefined()
    expect(size(result.modifier_values['attribute'])).toEqual(0)
    expect(size(result.modifier_values['attribute2'])).toEqual(1)
    expect(size(result.loss_values['attribute'])).toEqual(1)
    expect(result.loss_values['attribute2']).toBeUndefined()
    expect(size(result.loss_modifier_values['attribute'])).toEqual(1)
    expect(result.loss_modifier_values['attribute2']).toBeUndefined()
  })
  it('regenerates loss values', () => {
    const result = regenerateValues(initDefinition(0, 0, 0, 0), ValuesType.Loss, 'key1', [['attribute2', 1]])
    expect(size(result.base_values['attribute'])).toEqual(1)
    expect(result.base_values['attribute2']).toBeUndefined()
    expect(size(result.modifier_values['attribute'])).toEqual(1)
    expect(result.modifier_values['attribute2']).toBeUndefined()
    expect(size(result.loss_values['attribute'])).toEqual(0)
    expect(size(result.loss_values['attribute2'])).toEqual(1)
    expect(size(result.loss_modifier_values['attribute'])).toEqual(1)
    expect(result.loss_modifier_values['attribute2']).toBeUndefined()
  })
  it('regenerates loss modifier values', () => {
    const result = regenerateValues(initDefinition(0, 0, 0, 0), ValuesType.LossModifier, 'key1', [['attribute2', 1]])
    expect(size(result.base_values['attribute'])).toEqual(1)
    expect(result.base_values['attribute2']).toBeUndefined()
    expect(size(result.modifier_values['attribute'])).toEqual(1)
    expect(result.modifier_values['attribute2']).toBeUndefined()
    expect(size(result.loss_values['attribute'])).toEqual(1)
    expect(result.loss_values['attribute2']).toBeUndefined()
    expect(size(result.loss_modifier_values['attribute'])).toEqual(0)
    expect(size(result.loss_modifier_values['attribute2'])).toEqual(1)
  })
})

describe('calculateValue', () => {
  it('works for undefined', () => {
    const result = calculateValue(undefined, 'attribute')
    expect(result).toEqual(0)
  })
  it('works for base + modifier + loss + loss modifier value', () => {
    const result = calculateValue(initDefinition(1, 0.5, 0.75, 0.25), 'attribute')
    expect(result).toEqual(0.375)
  })
})

describe('calculateValueWithoutLoss', () => {
  it('works for undefined', () => {
    const result = calculateValueWithoutLoss(undefined, 'attribute')
    expect(result).toEqual(0)
  })
  it('works for base + modifier + loss + loss modifier value', () => {
    const result = calculateValueWithoutLoss(initDefinition(1, 0.5, 0.75, 0.25), 'attribute')
    expect(result).toEqual(1.5)
  })
})

describe('calculateBase', () => {
  it('works for base + modifier + loss + loss modifier value', () => {
    const result = calculateBase(initDefinition(1, 0.5, 0.75, 0.25), 'attribute')
    expect(result).toEqual(1)
  })
  it('works for multiple values', () => {
    const result = calculateBase(initBase(1, 0.5), 'attribute')
    expect(result).toEqual(1.5)
  })
})

describe('calculateModifier', () => {
  it('works for base + modifier + loss + loss modifier value', () => {
    const result = calculateModifier(initDefinition(1, 0.5, 0.75, 0.25), 'attribute')
    expect(result).toEqual(1.5)
  })
  it('works for multiple values', () => {
    const result = calculateModifier(initModifier(1, 0.5), 'attribute')
    expect(result).toEqual(2.5)
  })
})

describe('calculateLoss', () => {
  it('works for base + modifier + loss + loss modifier value', () => {
    const result = calculateLoss(initDefinition(1, 0.5, 0.75, 0.25), 'attribute')
    expect(result).toEqual(0.75)
  })
  it('works for multiple values', () => {
    const result = calculateLoss(initLoss(1, 0.5), 'attribute')
    expect(result).toEqual(1.5)
  })
})

describe('getValue', () => {
  it('Base: works base + modifier + loss value', () => {
    const result = getValue(ValuesType.Base, initDefinition(1, 0.5, 0.75, 0.25), 'attribute', 'key1')
    expect(result).toEqual(1)
  })
  it('Base: works for multiple values', () => {
    const result = getValue(ValuesType.Base, initBase(1, 0.5), 'attribute', 'key1')
    expect(result).toEqual(1)
  })
  it('Modifier: works base + modifier + loss value', () => {
    const result = getValue(ValuesType.Modifier, initDefinition(1, 0.5, 0.75, 0.25), 'attribute', 'key1')
    expect(result).toEqual(0.5)
  })
  it('Modifier: works for multiple values', () => {
    const result = getValue(ValuesType.Modifier, initModifier(1, 0.5), 'attribute', 'key1')
    expect(result).toEqual(1)
  })
  it('Loss: works base + modifier + loss value', () => {
    const result = getValue(ValuesType.Loss, initDefinition(1, 0.5, 0.75, 0.25), 'attribute', 'key1')
    expect(result).toEqual(0.75)
  })
  it('Loss: works for multiple values', () => {
    const result = getValue(ValuesType.Loss, initLoss(1, 0.5), 'attribute', 'key1')
    expect(result).toEqual(1)
  })
  it('Loss modifier: works base + modifier + loss value', () => {
    const result = getValue(ValuesType.LossModifier, initDefinition(1, 0.5, 0.75, 0.25), 'attribute', 'key1')
    expect(result).toEqual(0.25)
  })
  it('Loss modifier: works for multiple values', () => {
    const result = getValue(ValuesType.LossModifier, initLossModifier(1, 0.5), 'attribute', 'key1')
    expect(result).toEqual(1)
  })
})

describe('explainShort', () => {
  it('works for undefined', () => {
    const result = explainShort({}, 'attribute')
    expect(result).toEqual('')
  })
  it('works for missing', () => {
    const result = explainShort(initBase(1), 'missing')
    expect(result).toEqual('')
  })
  it('works for multiple values', () => {
    const result = explainShort(initBase(1, 0.5), 'attribute')
    expect(result).toEqual('key1: 1, key2: 0.5')
  })
})

/*describe('explain', () => {
  it('works for undefined', () => {
    const result = explain({ type: 'test', image: '' }, 'attribute')
    expect(result).toEqual('')
  })
  it('works for missing', () => {
    const result = explain(initBase(1), 'missing')
    expect(result).toEqual('')
  })
  it('works for multiple base values', () => {
    const result = explain(initBase(1, 0.5), 'attribute')
    expect(result).toEqual('key1: 1, key2: 0.5')
  })
  it('works for base + modifier + loss + loss modifier values', () => {
    const result = explain(initDefinition(1, 0.5, 0.75, 0.25), 'attribute')
    expect(result).toEqual('key1: 1 multiplied by 150% (key1: 50%) reduced by losses 0.75 (key1: 0.75)')
  })
  it('works for modifier + loss + loss modifier values', () => {
    const result = explain(initDefinition(undefined, 0.5, 0.75, 0.25), 'attribute')
    expect(result).toEqual('Base value 0 multiplied by 150% (key1: 50%) reduced by losses 0.75 (key1: 0.75)')
  })
  it('works for multiple base + modifier + loss values', () => {
    const result = explain({ type: 'test', image: '', base_values: get(1, 1.5), modifier_values: get(2, 2.5), loss_values: get(3, 3.5) }, 'attribute')
    expect(result).toEqual('Base value 2.5 (key1: 1, key2: 1.5) multiplied by 550% (key1: 200%, key2: 250%) reduced by losses 6.5 (key1: 3, key2: 3.5)')
  })
})*/

describe('strengthToValue', () => {
  it('works for naval', () => {
    const result = strengthToValue(DefinitionType.Naval, 0.75)
    expect(result).toEqual('75%')
  })
  it('works for land', () => {
    const result = strengthToValue(DefinitionType.Land, 0.75)
    expect(result).toEqual('750')
  })
})
