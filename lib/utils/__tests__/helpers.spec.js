import { spotifyParser } from '../helpers'

describe('#spotifyParser', () => {
  it('returns Spotify ID from URI', () => {
    expect(spotifyParser('spotify:track:6O0CiDfUBmoPsmGnLaOdUh')).toEqual(
      '6O0CiDfUBmoPsmGnLaOdUh'
    )
  })

  it('returns Spotify ID if just an ID', () => {
    expect(spotifyParser('6O0CiDfUBmoPsmGnLaOdUh')).toEqual(
      '6O0CiDfUBmoPsmGnLaOdUh'
    )
  })
})
