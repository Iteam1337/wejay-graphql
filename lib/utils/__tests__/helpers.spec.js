import { spotifyParser, getRoom } from '../helpers'

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

describe('#getRoom', () => {
  it('throws an error if room does not exist', async () => {
    expect.hasAssertions()

    try {
      getRoom([], 'test')
    } catch (e) {
      expect(e.message).toMatch(/Room does not exist/)
    }
  })

  it('returns a room', () => {
    const room = getRoom([{ name: 'test' }], 'test')

    expect(room).toEqual({
      name: 'test'
    })
  })
})
