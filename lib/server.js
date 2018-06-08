import { resolvers } from './graphql/resolvers'
import { GraphQLServer } from 'graphql-yoga'

const PORT = process.env.PORT || 4000

const options = {
  port: PORT,
}

const server = new GraphQLServer({
  typeDefs: './lib/graphql/schema.graphql',
  resolvers
})

server.start(options, () =>
  console.log(`Server is running on localhost:${PORT}`)
)
