import { v1 as neo4j } from 'neo4j-driver'

require('dotenv').config()

let driver

function neo4jAdapter(headers) {
  if (!driver) {
    driver = neo4j.driver(
      process.env.DB_URL,
      neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASSWORD)
    )
  }

  return {
    driver,
    headers
  }
}

export default neo4jAdapter
