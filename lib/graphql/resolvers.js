import { withFilter } from 'graphql-subscriptions'
import md5 from 'md5'
import uuidv4 from 'uuid/v4'

import Room from '../models/Room'
import pubsub from '../services/pubsub'
import spotify from '../services/spotify'
import { spotifyParser } from '../utils/helpers'

const rooms = []

const getRoom = name => {
  const room = rooms.find(room => room.name === name)

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
    room: (_, { name }) => {
      return getRoom(name)
    }
  },

  /// Mutations
  Mutation: {
    queueTrack: async (_, { input }) => {
      const { roomName, spotifyId, userId } = input
      const parsedUri = spotifyParser(spotifyId)
      const room = getRoom(roomName)

      const { body } = await spotify.getTrack(parsedUri)

      const newTrack = {
        album: body.album,
        artists: body.artists,
        duration: body.duration_ms,
        name: body.name,
        spotifyUri: body.uri,
        user: userId
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

      pubsub.publish('trackAdded', {
        roomName: room.name,
        trackAdded: newTrack
      })

      return newTrack
    },

    addRoom: (_, { roomName }) => {
      const newRoom = new Room(roomName, uuidv4())

      rooms.push(newRoom)

      return newRoom
    },

    nextTrack: (_, { roomName }) => {
      const room = getRoom(roomName)

      room.next()

      return room
    },

    joinRoom: async (_, { input }) => {
      const { email, roomName } = input
      const room = getRoom(roomName)
      const id = md5(email)

      const newUser = {
        email,
        id
      }

      if (room.users.find(user => user.id === id)) {
        throw new Error('Already in room')
      }

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
          return payload.roomName === variables.roomName
        }
      )
    },

    onNextTrack: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('onNextTrack'),
        (payload, variables) => {
          return payload.roomName === variables.roomName
        }
      )
    }
  }
}
