import spotify from '../services/spotify'
import { spotifyParser } from '../utils/helpers'
import { PubSub, withFilter } from 'graphql-subscriptions'
import uuidv4 from 'uuid/v4'
import Room from '../models/Room'

const rooms = []

const pubsub = new PubSub()

const getRoom = id => {
  const room = rooms.find(room => room.id === id)

  if (!room) {
    throw new Error('Room does not exist')
  }

  return room
}

export const resolvers = {
  /// Queries
  Query: {
    rooms: () => {
      return rooms
    },
    room: (_, { id }) => {
      return getRoom(id)
    }
  },

  /// Mutations
  Mutation: {
    queueTrack: async (_, { input }) => {
      const { roomId, spotifyId } = input
      const parsedUri = spotifyParser(spotifyId)
      const room = getRoom(roomId)

      const { body } = await spotify.getTrack(parsedUri)

      const newTrack = {
        album: body.album,
        artists: body.artists,
        duration: body.duration_ms,
        name: body.name,
        spotifyUri: body.uri
      }

      if (
        room.currentTrack &&
        room.currentTrack.spotifyUri === newTrack.spotifyUri
      ) {
        throw new Error('Already playing')
      }

      if (room.queue.find(q => q.spotifyUri === newTrack.spotifyUri)) {
        throw new Error('Already in queue')
      }

      room.queueTrack(newTrack)

      pubsub.publish('trackAdded', { roomId, trackAdded: newTrack })

      return newTrack
    },

    addRoom: (_, { roomName }) => {
      const newRoom = new Room(roomName, uuidv4())

      rooms.push(newRoom)

      return newRoom
    },

    nextTrack: (_, { roomId }) => {
      const room = getRoom(roomId)

      room.next()

      return room
    },

    joinRoom: async (_, { input }) => {
      const { email, roomId } = input
      const room = getRoom(roomId)

      const newUser = { email }
      room.join(newUser)

      return room
    }
  },

  /// Subscriptions
  Subscription: {
    trackAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('trackAdded'),
        (payload, variables) => {
          return payload.roomId === variables.roomId
        }
      )
    }
  }
}
