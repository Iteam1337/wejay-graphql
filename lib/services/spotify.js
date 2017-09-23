import SpotifyWebApi from 'spotify-web-api-node'

require('dotenv').config()

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
})

let timer

spotifyApi.clientCredentialsGrant().then(
  data => {
    if (data.body) {
      console.log('updated token - ', Date.now())

      spotifyApi.setAccessToken(data.body['access_token'])

      timer = setInterval(() => {
        spotifyApi.clientCredentialsGrant().then(data => {
          console.log('updated token - ', Date.now())

          spotifyApi.setAccessToken(data.body['access_token'])
        })
      }, data.body['expires_in'] * 1000)
    }
  },
  err => {
    console.log(
      'Something went wrong when retrieving an access token',
      err.message
    )
  }
)

export default spotifyApi
