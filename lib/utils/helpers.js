export const spotifyParser = uri => {
  if (uri.includes('spotify:track')) {
    const parsedId = uri.split(':')
    return parsedId[parsedId.length - 1]
  }

  return uri
}

export const getRoom = (rooms, name) => {
  const room = rooms.find(room => room.name === name)

  if (!room) {
    throw new Error('Room does not exist')
  }

  return room
}
