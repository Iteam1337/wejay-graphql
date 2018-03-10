import { withFilter } from 'graphql-subscriptions'
import md5 from 'md5'
import uuidv4 from 'uuid/v4'

import Room from '../models/Room'
import pubsub from '../services/pubsub'
import spotify from '../services/spotify'
import { getRoom, spotifyParser, wejayTrack } from '../utils/helpers'

const rooms = []

const createSubscription = subscriptionName => {
  return withFilter(
    () => pubsub.asyncIterator(subscriptionName),
    (payload, variables) => payload.roomName === variables.roomName
  )
}

export const resolvers = {
  /// Queries
  Query: {
    rooms: () => rooms,
    room: (_, { name }) => getRoom(rooms, name)
  },

  /// Mutations
  Mutation: {
    queueTrack: async (_, { input }) => {
      const { roomName, spotifyId, userId } = input
      const parsedUri = spotifyParser(spotifyId)
      const room = getRoom(rooms, roomName)

      const { body } = await spotify.getTrack(parsedUri)

      const newTrack = wejayTrack(body)

      if (
        room.currentTrack &&
        room.currentTrack.spotifyUri === newTrack.spotifyUri
      ) {
        throw new Error('Already playing')
      }

      if (room.queue.find(q => q.spotifyUri === newTrack.spotifyUri)) {
        throw new Error('Already in queue')
      }

      room.queueTrack({
        ...newTrack,
        user: userId
      })

      pubsub.publish('roomUpdated', {
        roomName,
        roomUpdated: room
      })

      return newTrack
    },

    addRoom: (_, { roomName }) => {
      const newRoom = new Room(roomName, uuidv4())

      rooms.push(newRoom)

      return newRoom
    },

    nextTrack: (_, { roomName }) => {
      const room = getRoom(rooms, roomName)

      room.next()

      pubsub.publish('roomUpdated', {
        roomName,
        roomUpdated: room
      })

      return room
    },

    joinRoom: (_, { input }) => {
      const { email, roomName } = input
      const room = getRoom(rooms, roomName)
      const id = md5(email)

      const newUser = {
        email,
        id,
        lastPlay: 0
      }

      if (room.users.find(user => user.id === id)) {
        return room
      }

      room.join(newUser)

      pubsub.publish('roomUpdated', {
        roomName,
        roomUpdated: room
      })

      return room
    },

    search: async (_, { query }) => {
      const { body } = await spotify.searchTracks(query)

      return body.tracks.items.map(track => wejayTrack(track))
    },

    play: (_, { roomName }) => {
      const room = getRoom(rooms, roomName)

      room.play()

      pubsub.publish('onPlay', {
        roomName
      })
    },

    pause: (_, { roomName }) => {
      const room = getRoom(rooms, roomName)

      room.pause()

      pubsub.publish('onPause', {
        roomName
      })
    }
  },

  /// Subscriptions
  Subscription: {
    roomUpdated: {
      subscribe: createSubscription('roomUpdated')
    },

    onNextTrack: {
      subscribe: createSubscription('onNextTrack')
    },

    onPause: {
      subscribe: createSubscription('onPause')
    },

    onPlay: {
      subscribe: createSubscription('onPlay')
    }
  }
}
