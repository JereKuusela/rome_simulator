import { Map, OrderedMap } from 'immutable'
import { getImage, mergeValues, addValues, ValuesType, clearAllValues, clearValues, regenerateValues, calculateValue, calculateValueWithoutLoss, calculateBase, calculateModifier, calculateLoss, getBaseValue, getModifierValue, getLossValue, strengthToValue, DefinitionType, explainShort, explain } from '../base_definition'
import EmptyIcon from '../images/empty.png'
import UnknownIcon from '../images/unknown.png'

describe('getImage', () => {
  it('returns image', () => {
    const definition = { image: 'test'}
    const result = getImage(definition)
    expect(result).toEqual('test')
  })
  it('returns unknown', () => {
    const definition = { image: undefined }
    const result = getImage(definition)
    expect(result).toEqual(UnknownIcon)
  })
  it('returns empty', () => {
    const result = getImage(undefined)
    expect(result).toEqual(EmptyIcon)
  })
})

const initValues = (attribute: string, key: string, value: number) => (
  Map<string, OrderedMap<string, number>>().set(attribute, OrderedMap<string, number>().set(key, value))
)

const get = (value1?: number, value2?: number) => {
  if (value1 !== undefined && value2 !== undefined)
    return Map<string, OrderedMap<string, number>>().set('attribute', OrderedMap<string, number>().set('key1', value1).set('key2', value2))
  if (value1 !== undefined)
    return Map<string, OrderedMap<string, number>>().set('attribute', OrderedMap<string, number>().set('key1', value1))
    return Map<string, OrderedMap<string, number>>().set('attribute', OrderedMap<string, number>())
}

const initDefinition = (value1: number | undefined, value2: number | undefined, value3: number | undefined) => (
  { type: 'test', base_values: get(value1), modifier_values: get(value2), loss_values: get(value3) }
)

const initBase = (value1: number, value2?: number) => (
  { type: 'test', base_values: get(value1, value2) }
)

const initModifier = (value1: number, value2?: number) => (
  { type: 'test', modifier_values: get(value1, value2) }
)

const initLoss = (value1: number, value2?: number) => (
  { type: 'test', loss_values: get(value1, value2) }
)

describe('mergeValues', () => {
  it('returns first when only', () => {
    const result = mergeValues({ type: 'test'}, undefined)
    expect(result.type).toEqual('test')
  })
  it('returns second when only', () => {
    const result = mergeValues(undefined, { type: 'test'})
    expect(result.type).toEqual('test')
  })
  it('returns first when both', () => {
    const result = mergeValues({ type: 'test1'}, { type: 'test2'})
    expect(result.type).toEqual('test1')
  })
  it('generates empty values', () => {
    const definition = { type: 'test', base_values: undefined, modifier_values: undefined, loss_values: undefined}
    const result = mergeValues(definition, undefined)
    expect(result.base_values).toBeTruthy()
    expect(result.modifier_values).toBeTruthy()
    expect(result.loss_values).toBeTruthy()
  })
  it('merges different values', () => {
    const definition = { type: 'test', base_values: initValues('test1', 'key1', 0), modifier_values: initValues('test1', 'key2', 0), loss_values: initValues('test1', 'key3', 0)}
    const toMerge = { type: 'test', base_values: initValues('test2', 'key1', 0), modifier_values: initValues('test2', 'key2', 0), loss_values: initValues('test2', 'key3', 0)}
    const result = mergeValues(definition, toMerge)
    expect(result.base_values.count()).toEqual(2)
    expect(result.modifier_values.count()).toEqual(2)
    expect(result.loss_values.count()).toEqual(2)
    expect(result.base_values.get('test1')!.count()).toEqual(1)
    expect(result.modifier_values.get('test1')!.count()).toEqual(1)
    expect(result.loss_values.get('test1')!.count()).toEqual(1)
    expect(result.base_values.get('test2')!.count()).toEqual(1)
    expect(result.modifier_values.get('test2')!.count()).toEqual(1)
    expect(result.loss_values.get('test2')!.count()).toEqual(1)
  })
  it('merges same values', () => {
    const result = mergeValues(initDefinition(0, 0, 0), initDefinition(1, 2, 3))
    expect(result.base_values.get('attribute')!.count()).toEqual(1)
    expect(result.modifier_values.get('attribute')!.count()).toEqual(1)
    expect(result.loss_values.get('attribute')!.count()).toEqual(1)
    expect(result.base_values.getIn(['attribute', 'key1'])).toEqual(1)
    expect(result.modifier_values.getIn(['attribute', 'key1'])).toEqual(2)
    expect(result.loss_values.getIn(['attribute', 'key1'])).toEqual(3)
  })
})

describe('addValues', () => {
  it('generates empty base values', () => {
    const result = addValues({ type: 'test', base_values: undefined }, ValuesType.Base, 'key1', [])
    expect(result.base_values).toBeTruthy
  })
  it('generates empty modifier values', () => {
    const result = addValues({ type: 'test', modifier_values: undefined }, ValuesType.Modifier, 'key1', [])
    expect(result.modifier_values).toBeTruthy
  })
  it('generates empty loss values', () => {
    const result = addValues({ type: 'test', loss_values: undefined }, ValuesType.Loss, 'key1', [])
    expect(result.loss_values).toBeTruthy
  })
  it('adds to base values', () => {
    const result = addValues(initBase(0), ValuesType.Base, 'key2', [['attribute', 1]])
    expect(result.base_values.count()).toEqual(1)
    expect(result.base_values.get('attribute')!.count()).toEqual(2)
    expect(result.base_values.getIn(['attribute', 'key1'])).toEqual(0)
    expect(result.base_values.getIn(['attribute', 'key2'])).toEqual(1)
  })
  it('adds to modifier values', () => {
    const result = addValues(initModifier(0), ValuesType.Modifier, 'key2', [['attribute', 1]])
    expect(result.modifier_values.count()).toEqual(1)
    expect(result.modifier_values.get('attribute')!.count()).toEqual(2)
    expect(result.modifier_values.getIn(['attribute', 'key1'])).toEqual(0)
    expect(result.modifier_values.getIn(['attribute', 'key2'])).toEqual(1)
  })
  it('adds to loss values', () => {
    const result = addValues(initLoss(0), ValuesType.Loss, 'key2', [['attribute', 1]])
    expect(result.loss_values.count()).toEqual(1)
    expect(result.loss_values.get('attribute')!.count()).toEqual(2)
    expect(result.loss_values.getIn(['attribute', 'key1'])).toEqual(0)
    expect(result.loss_values.getIn(['attribute', 'key2'])).toEqual(1)
  })
  it('merges to base values', () => {
    const result = addValues(initBase(0), ValuesType.Base, 'key1', [['attribute', 1]])
    expect(result.base_values.count()).toEqual(1)
    expect(result.base_values.get('attribute')!.count()).toEqual(1)
    expect(result.base_values.getIn(['attribute', 'key1'])).toEqual(1)
  })
  it('merges to modifier values', () => {
    const result = addValues(initModifier(0), ValuesType.Modifier, 'key1', [['attribute', 1]])
    expect(result.modifier_values.count()).toEqual(1)
    expect(result.modifier_values.get('attribute')!.count()).toEqual(1)
    expect(result.modifier_values.getIn(['attribute', 'key1'])).toEqual(1)
  })
  it('merges to loss values', () => {
    const result = addValues(initLoss(0), ValuesType.Loss, 'key1', [['attribute', 1]])
    expect(result.loss_values.count()).toEqual(1)
    expect(result.loss_values.get('attribute')!.count()).toEqual(1)
    expect(result.loss_values.getIn(['attribute', 'key1'])).toEqual(1)
  })
})

describe('clearAllValues', () => {
  it('resets empty values', () => {
    const result = clearAllValues({ type: 'test', base_values: undefined, modifier_values: undefined, loss_values: undefined }, 'key1')
    expect(result.base_values).toBeTruthy
    expect(result.modifier_values).toBeTruthy
    expect(result.loss_values).toBeTruthy
  })
  it('clears all values', () => {
    const result = clearAllValues(initDefinition(0, 0, 0), 'key1')
    expect(result.base_values.count()).toEqual(1)
    expect(result.base_values.get('attribute')!.count()).toEqual(0)
    expect(result.modifier_values.count()).toEqual(1)
    expect(result.modifier_values.get('attribute')!.count()).toEqual(0)
    expect(result.loss_values.count()).toEqual(1)
    expect(result.loss_values.get('attribute')!.count()).toEqual(0)
  })
  it('leaves other values', () => {
    const result = clearAllValues(initDefinition(0, 0, 0), 'key2')
    expect(result.base_values.count()).toEqual(1)
    expect(result.base_values.get('attribute')!.count()).toEqual(1)
    expect(result.modifier_values.count()).toEqual(1)
    expect(result.modifier_values.get('attribute')!.count()).toEqual(1)
    expect(result.loss_values.count()).toEqual(1)
    expect(result.loss_values.get('attribute')!.count()).toEqual(1)
  })
})

describe('clearValues', () => {
  it('clears base values', () => {
    const result = clearValues(initDefinition(0, 0, 0), ValuesType.Base, 'key1')
    expect(result.base_values.get('attribute')!.count()).toEqual(0)
    expect(result.modifier_values.get('attribute')!.count()).toEqual(1)
    expect(result.loss_values.get('attribute')!.count()).toEqual(1)
  })
  it('clears modifier values', () => {
    const result = clearValues(initDefinition(0, 0, 0), ValuesType.Modifier, 'key1')
    expect(result.base_values.get('attribute')!.count()).toEqual(1)
    expect(result.modifier_values.get('attribute')!.count()).toEqual(0)
    expect(result.loss_values.get('attribute')!.count()).toEqual(1)
  })
  it('clears loss values', () => {
    const result = clearValues(initDefinition(0, 0, 0), ValuesType.Loss, 'key1')
    expect(result.base_values.get('attribute')!.count()).toEqual(1)
    expect(result.modifier_values.get('attribute')!.count()).toEqual(1)
    expect(result.loss_values.get('attribute')!.count()).toEqual(0)
  })
})

describe('regenerateValues', () => {
  it('regenerates base values', () => {
    const result = regenerateValues(initDefinition(0, 0, 0), ValuesType.Base, 'key1', [['attribute2', 1]])
    expect(result.base_values.get('attribute')!.count()).toEqual(0)
    expect(result.base_values.get('attribute2')!.count()).toEqual(1)
    expect(result.modifier_values.get('attribute')!.count()).toEqual(1)
    expect(result.modifier_values.get('attribute2')).toBeUndefined()
    expect(result.loss_values.get('attribute')!.count()).toEqual(1)
    expect(result.loss_values.get('attribute2')).toBeUndefined()
  })
  it('regenerates modifier values', () => {
    const result = regenerateValues(initDefinition(0, 0, 0), ValuesType.Modifier, 'key1', [['attribute2', 1]])
    expect(result.base_values.get('attribute')!.count()).toEqual(1)
    expect(result.base_values.get('attribute2')).toBeUndefined()
    expect(result.modifier_values.get('attribute')!.count()).toEqual(0)
    expect(result.modifier_values.get('attribute2')!.count()).toEqual(1)
    expect(result.loss_values.get('attribute')!.count()).toEqual(1)
    expect(result.loss_values.get('attribute2')).toBeUndefined()
  })
  it('regenerates loss values', () => {
    const result = regenerateValues(initDefinition(0, 0, 0), ValuesType.Loss, 'key1', [['attribute2', 1]])
    expect(result.base_values.get('attribute')!.count()).toEqual(1)
    expect(result.base_values.get('attribute2')).toBeUndefined()
    expect(result.modifier_values.get('attribute')!.count()).toEqual(1)
    expect(result.modifier_values.get('attribute2')).toBeUndefined()
    expect(result.loss_values.get('attribute')!.count()).toEqual(0)
    expect(result.loss_values.get('attribute2')!.count()).toEqual(1)
  })
})

describe('calculateValue', () => {
  it('works for undefined', () => {
    const result = calculateValue(undefined, 'attribute')
    expect(result).toEqual(0)
  })
  it('works for base + modifier + loss value', () => {
    const result = calculateValue(initDefinition(1, 0.5, 0.75), 'attribute')
    expect(result).toEqual(0.75)
  })
})

describe('calculateValueWithoutLoss', () => {
  it('works for undefined', () => {
    const result = calculateValueWithoutLoss(undefined, 'attribute')
    expect(result).toEqual(0)
  })
  it('works for base + modifier + loss value', () => {
    const result = calculateValueWithoutLoss(initDefinition(1, 0.5, 0.75), 'attribute')
    expect(result).toEqual(1.5)
  })
})

describe('calculateBase', () => {
  it('works for base + modifier + loss value', () => {
    const result = calculateBase(initDefinition(1, 0.5, 0.75), 'attribute')
    expect(result).toEqual(1)
  })
  it('works for multiple values', () => {
    const result = calculateBase(initBase(1, 0.5), 'attribute')
    expect(result).toEqual(1.5)
  })
})

describe('calculateModifier', () => {
  it('works for base + modifier + loss value', () => {
    const result = calculateModifier(initDefinition(1, 0.5, 0.75), 'attribute')
    expect(result).toEqual(1.5)
  })
  it('works for multiple values', () => {
    const result = calculateModifier(initModifier(1, 0.5), 'attribute')
    expect(result).toEqual(2.5)
  })
})

describe('calculateLoss', () => {
  it('works for base + modifier + loss value', () => {
    const result = calculateLoss(initDefinition(1, 0.5, 0.75), 'attribute')
    expect(result).toEqual(0.75)
  })
  it('works for multiple values', () => {
    const result = calculateLoss(initLoss(1, 0.5), 'attribute')
    expect(result).toEqual(1.5)
  })
})

describe('getBaseValue', () => {
  it('works base + modifier + loss value', () => {
    const result = getBaseValue(initDefinition(1, 0.5, 0.75), 'attribute', 'key1')
    expect(result).toEqual(1)
  })
  it('works for multiple values', () => {
    const result = getBaseValue(initBase(1, 0.5), 'attribute', 'key1')
    expect(result).toEqual(1)
  })
})

describe('getModifierValue', () => {
  it('works base + modifier + loss value', () => {
    const result = getModifierValue(initDefinition(1, 0.5, 0.75), 'attribute', 'key1')
    expect(result).toEqual(0.5)
  })
  it('works for multiple values', () => {
    const result = getModifierValue(initModifier(1, 0.5), 'attribute', 'key1')
    expect(result).toEqual(1)
  })
})

describe('getLossValue', () => {
  it('works base + modifier + loss value', () => {
    const result = getLossValue(initDefinition(1, 0.5, 0.75), 'attribute', 'key1')
    expect(result).toEqual(0.75)
  })
  it('works for multiple values', () => {
    const result = getLossValue(initLoss(1, 0.5), 'attribute', 'key1')
    expect(result).toEqual(1)
  })
})

describe('explainShort', () => {
  it('works for undefined', () => {
    const result = explainShort({ type: 'test' }, 'attribute')
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

describe('explain', () => {
  it('works for undefined', () => {
    const result = explain({ type: 'test' }, 'attribute')
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
  it('works for base + modifier + loss values', () => {
    const result = explain(initDefinition(1, 0.5, 0.75), 'attribute')
    expect(result).toEqual('key1: 1 multiplied by 150% (key1: 50%) reduced by losses 0.75 (key1: 0.75)')
  })
  it('works for modifier + loss values', () => {
    const result = explain(initDefinition(undefined, 0.5, 0.75), 'attribute')
    expect(result).toEqual('Base value 0 multiplied by 150% (key1: 50%) reduced by losses 0.75 (key1: 0.75)')
  })
  it('works for multiple base + modifier + loss values', () => {
    const result = explain({ type: 'test',  base_values: get(1, 1.5), modifier_values: get(2, 2.5), loss_values: get(3, 3.5) }, 'attribute')
    expect(result).toEqual('Base value 2.5 (key1: 1, key2: 1.5) multiplied by 550% (key1: 200%, key2: 250%) reduced by losses 6.5 (key1: 3, key2: 3.5)')
  })
})

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
