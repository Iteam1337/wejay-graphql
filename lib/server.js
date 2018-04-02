import { resolvers } from './graphql/resolvers'
import { GraphQLServer } from 'graphql-yoga'
import neo4j from './adapters/neo4j'

const PORT = process.env.PORT || 4000

const options = {
  port: PORT
}

const server = new GraphQLServer({
  typeDefs: './lib/graphql/schema.graphql',
  resolvers,
  context: req => neo4j(req.headers)
})

server.start(options, () =>
  console.log(`Server is running on localhost:${PORT}`)
)
