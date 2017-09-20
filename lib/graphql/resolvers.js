import spotify from '../services/spotify'

const rooms = [
  {
    id: '1',
    name: 'Test',
    queue: [],
    users: []
  },
  {
    id: '2',
    name: 'Iteam',
    queue: [],
    users: []
  }
]

export const resolvers = {
  /// Queries
  Query: {
    rooms: () => {
      return rooms
    },
    room: (_, { id }) => {
      return rooms.find(room => room.id === id)
    }
  },

  /// Mutations
  Mutation: {
    queueTrack: async (_, { input }) => {
      const { roomId } = input
      let { spotifyId } = input

      if (spotifyId.includes('spotify:track')) {
        const parsedId = spotifyId.split(':')
        spotifyId = parsedId[parsedId.length - 1]
      }

      const room = rooms.find(room => room.id === roomId)

      if (!room) {
        throw new Error('Room does not exist')
      }

      const { body } = await spotify.getTrack(spotifyId)

      const newTrack = {
        album: body.album,
        artists: body.artists,
        duration: body.duration_ms,
        name: body.name,
        spotifyUri: body.uri
      }

      room.queue.push(newTrack)

      return newTrack
    }
  }
}
