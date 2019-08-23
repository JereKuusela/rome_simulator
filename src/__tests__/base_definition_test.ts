import { getImage } from "../base_definition"
import EmptyIcon from '../images/empty.png'
import UnknownIcon from '../images/unknown.png'

describe('getImage', () => {
  it('returns image', () => {
    const definition = { image: 'test'}
    const image = getImage(definition)
    expect(image).toEqual('test')
  })

  it('returns unknown', () => {
    const definition = { image: undefined }
    const image = getImage(definition)
    expect(image).toEqual(UnknownIcon)
  })
  
  it('returns empty', () => {
    const image = getImage(undefined)
    expect(image).toEqual(UnknownIcon)
  })
})
