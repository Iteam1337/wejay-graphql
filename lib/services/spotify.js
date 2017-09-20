import SpotifyWebApi from 'spotify-web-api-node'

require('dotenv').config()

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
})

spotifyApi.clientCredentialsGrant().then(
  data => {
    if (data.body) {
      console.log('The access token expires in ' + data.body['expires_in'])
      console.log('The access token is ' + data.body['access_token'])

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token'])
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
