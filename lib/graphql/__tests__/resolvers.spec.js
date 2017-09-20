import { resolvers } from '../resolvers'

// jest.mock('spotify-web-api-node', () =>
//   jest.fn(() => ({
//     clientCredentialsGrant: jest.fn(() => Promise.resolve({})),
//     setAccessToken: jest.fn()
//   }))
// )

jest.mock('../../services/spotify', () => ({
  getTrack: jest.fn()
}))

describe('resolvers/Query', () => {
  describe('#rooms', () => {
    it('returns current rooms', () => {
      expect(resolvers.Query.rooms()).toMatchSnapshot()
    })
  })

  describe('#room', () => {
    it('finds one room using id', () => {
      expect(resolvers.Query.room(null, { id: '1' })).toMatchSnapshot()
    })
  })
})
