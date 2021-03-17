import React, { useRef } from 'react'
import JSZip from 'jszip'
import { Grid } from 'semantic-ui-react'
import { binaryToPlain, parseFile } from 'saves/importer'

import tokens from 'data/json/ir/binary.json'
import { FileInput } from '../components/Utils/Input'

const mapper = (
  mapping: Record<string, string>,
  compressed: Record<string, unknown>,
  plain: Record<string, unknown>
) => {
  if (!compressed || !plain) return
  // Ironman key doesn't exist on plain save.
  const keys = Object.keys(compressed).filter(key => key !== 'ironman')
  const correctKeys = Object.keys(plain).filter(key => key !== 'ironman')
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const correctKey = correctKeys[i]
    const value = compressed[keys[i]]
    const correctValue = plain[correctKeys[i]]
    if (key !== correctKey) mapping[key.substr(2).padStart(4, '0')] = correctKey
    if (typeof value === 'object' && value)
      mapper(mapping, value as Record<string, unknown>, correctValue as Record<string, unknown>)
    else {
      if (typeof value === 'string' && value.startsWith('x_')) {
        if (value !== correctValue) mapping[value.substr(2).padStart(4, '0')] = String(correctValue)
      } else if (value !== correctValue) {
        console.log(key)
        console.log(value)
        console.log(compressed)
        console.log(correctKey)
        console.log(correctValue)
        console.log(plain)
      }
    }
  }
}

const SaveToken = () => {
  const plain = useRef<File | undefined>()
  const compressed = useRef<File | undefined>()

  const doMapping = () => {
    if (!plain.current || !compressed.current) return
    plain.current.text().then(data => {
      const plainFile = parseFile(data)
      if (!compressed.current) return

      new JSZip().loadAsync(compressed.current).then(zip => {
        zip
          .file('gamestate')
          ?.async('uint8array')
          .then(buffer => {
            const compressedFile = parseFile(binaryToPlain(buffer, false)[0])

            const mapping: { [key: string]: string } = tokens

            mapper(mapping, compressedFile, plainFile)
            const sortedMapping: { [key: string]: string } = {}
            Object.keys(mapping)
              .sort()
              .forEach(key => (sortedMapping[key] = mapping[key]))
            const blob = new Blob([JSON.stringify(sortedMapping, undefined, 2)], { type: 'text/plain;charset=utf-8' })
            saveAs(blob, 'tokens.json')

            plain.current = undefined
            compressed.current = undefined
          })
      })
    })
  }

  const loadPlain = (file: File) => {
    plain.current = file
    doMapping()
  }

  const loadSave = (file: File) => {
    compressed.current = file
    doMapping()
  }

  return (
    <Grid padded>
      <Grid.Row columns='2'>
        <Grid.Column>
          Plain
          <FileInput onChange={loadPlain} />
        </Grid.Column>
        <Grid.Column>
          Compressed
          <FileInput onChange={loadSave} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default SaveToken
