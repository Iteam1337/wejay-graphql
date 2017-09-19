import SpotifyWebApi from 'spotify-web-api-node'

require('dotenv').config()

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

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
})

spotifyApi.clientCredentialsGrant().then(
  data => {
    console.log('The access token expires in ' + data.body['expires_in'])
    console.log('The access token is ' + data.body['access_token'])

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token'])
  },
  err => {
    console.log(
      'Something went wrong when retrieving an access token',
      err.message
    )
  }
)

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

      const { body } = await spotifyApi.getTrack(spotifyId)

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
