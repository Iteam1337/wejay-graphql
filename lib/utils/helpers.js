export const spotifyParser = uri => {
  if (uri.includes('spotify:track')) {
    const parsedId = uri.split(':')
    return parsedId[parsedId.length - 1]
  }

  return uri
}
