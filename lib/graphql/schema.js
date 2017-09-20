import { makeExecutableSchema } from 'graphql-tools'

import { resolvers } from './resolvers'

const typeDefs = `
  type Album {
    images: [Cover]
    name: String
    uri: String
  }

  type Artist {
    name: String
    uri: String
  }

  type Cover {
    height: Int
    url: String
    width: Int
  }

  type Track {
    album: Album
    artists: [Artist]
    duration: Float
    name: String
    spotifyUri: String
  }

  type User {
    email: String
  }

  type Room {
    id: ID!
    history: [Track]!
    name: String!
    currentTrack: Track
    queue: [Track]!
    users: [User]!
  }

  input QueueInput {
    roomName: String!
    spotifyId: String!
  }

  input JoinRoomInput {
    roomName: String!
    email: String!    
  }

  type Query {
    rooms: [Room]
    room(name: String!): Room
  }

  type Mutation {
    addRoom(roomName: String!): Room
    joinRoom(input: JoinRoomInput!): Room
    nextTrack(roomName: String!): Room
    queueTrack(input: QueueInput!): Track
  }

  type Subscription {
    trackAdded(roomName: String!): Track
    onNextTrack(roomName: String!): Track
  }
`

const schema = makeExecutableSchema({ typeDefs, resolvers })

export { schema }
