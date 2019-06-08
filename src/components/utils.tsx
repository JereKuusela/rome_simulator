import React from 'react'
import { OrderedSet } from 'immutable'
import { Image } from 'semantic-ui-react'

export const renderImages = (images: OrderedSet<string>) => images.map(image => <Image key={image} src={image} avatar />)
