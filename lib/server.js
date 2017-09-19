import bodyParser from 'body-parser'
import express from 'express'
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express'

import { schema } from './graphql/schema'

const PORT = 4000
const server = express()

server.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress({
    schema
  })
)

server.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql'
  })
)

server.listen(PORT, () =>
  console.log(
    `GraphQL Server is now running on http://localhost:${PORT}/graphiql`
  )
)
