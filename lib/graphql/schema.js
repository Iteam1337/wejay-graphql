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
    roomId: ID!
    spotifyId: String!
  }

  input JoinRoomInput {
    roomId: ID!
    email: String!    
  }

  type Query {
    rooms: [Room]
    room(id: ID!): Room
  }

  type Mutation {
    addRoom(roomName: String!): Room
    joinRoom(input: JoinRoomInput!): Room
    nextTrack(roomId: String!): Room
    queueTrack(input: QueueInput!): Track
  }

  type Subscription {
    trackAdded(roomId: ID!): Track
  }
`

const schema = makeExecutableSchema({ typeDefs, resolvers })

export { schema }
