import { resolvers } from '../resolvers'
import spotify from '../../services/spotify'

jest.mock('../../services/spotify', () => ({
  getTrack: jest.fn()
}))

jest.mock('uuid/v4', () => jest.fn(() => '1'))

describe('resolvers', () => {
  describe('Query', () => {
    describe('#rooms', () => {
      it('returns current rooms', () => {
        expect(resolvers.Query.rooms()).toMatchSnapshot()
      })
    })

    describe('#room', () => {
      it('throws an error if no room is found', async () => {
        try {
          await resolvers.Query.room(null, { id: '9001' })
        } catch (e) {
          expect(e.message).toMatch(/Room does not exist/)
        }
      })

      it('finds one room using id', () => {
        resolvers.Mutation.addRoom(null, { roomName: 'test' })

        expect(resolvers.Query.room(null, { id: '1' })).toMatchSnapshot()
      })
    })
  })

  describe('Mutations', () => {
    describe('#queueTrack', () => {
      it('throws an error if no room is found', async () => {
        try {
          const input = {
            roomId: '1337',
            spotifyId: 'spotify:track:6Inmo6ElDCaiZCiB6lficH'
          }

          await resolvers.Mutation.queueTrack(null, { input })
        } catch (e) {
          expect(e.message).toMatch(/Room does not exist/)
        }
      })

      it('gets the track information from the Spotify API', async () => {
        try {
          const input = {
            roomId: '1',
            spotifyId: 'spotify:track:6Inmo6ElDCaiZCiB6lficH'
          }

          spotify.getTrack.mockImplementationOnce(() =>
            Promise.resolve({ body: {} })
          )

          resolvers.Mutation.addRoom(null, { roomName: 'test' })

          await resolvers.Mutation.queueTrack(null, { input })

          expect(spotify.getTrack).toHaveBeenCalledWith(
            '6Inmo6ElDCaiZCiB6lficH'
          )
        } catch (e) {
          throw new Error(e)
        }
      })

      it('returns the new track', async () => {
        try {
          const input = {
            roomId: '1',
            spotifyId: 'spotify:track:6Inmo6ElDCaiZCiB6lficH'
          }

          spotify.getTrack.mockImplementationOnce(() =>
            Promise.resolve({
              body: {
                album: {
                  name: 'albumname'
                },
                artists: [{ name: 'artist' }],
                duration_ms: 30000,
                name: 'track',
                uri: '6Inmo6ElDCaiZCiB6lficH'
              }
            })
          )

          resolvers.Mutation.addRoom(null, { roomName: 'test' })

          const queuedTrack = await resolvers.Mutation.queueTrack(null, {
            input
          })

          expect(queuedTrack).toMatchSnapshot()
        } catch (e) {
          throw new Error(e)
        }
      })
    })

    describe('#addRoom', () => {
      it('returns a new room', () => {
        expect(
          resolvers.Mutation.addRoom(null, { roomName: 'newRoom' })
        ).toMatchSnapshot()
      })
    })

    describe('#joinRoom', () => {
      it('throws an error if no room is found', async () => {
        try {
          const input = {
            roomId: '9001',
            email: 'cookie@monster.com'
          }

          await resolvers.Mutation.joinRoom(null, { input })
        } catch (e) {
          expect(e.message).toMatch(/Room does not exist/)
        }
      })

      it('returns the updated room', async () => {
        try {
          const input = {
            roomId: '1',
            email: 'cookie@monster.com'
          }

          resolvers.Mutation.addRoom(null, { roomName: 'test' })

          const updatedRoom = await resolvers.Mutation.joinRoom(null, { input })

          expect(updatedRoom).toMatchSnapshot()
        } catch (e) {
          throw new Error(e)
        }
      })
    })
  })
})
