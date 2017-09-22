import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { execute, subscribe } from 'graphql'
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import { schema } from './graphql/schema'

const PORT = process.env.PORT || 4000
const server = express()

server.use('*', cors({ origin: 'http://localhost:3000' }))

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
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:4000/subscriptions`
  })
)

const ws = createServer(server)

ws.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:${PORT}`)

  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema
    },
    {
      server: ws,
      path: '/subscriptions'
    }
  )
})
