import React from 'react'
import { Image } from 'semantic-ui-react'

export const renderImages = (images: Set<string>): JSX.Element[] => Array.from(images).map(image => <Image key={image} src={image} avatar />)
