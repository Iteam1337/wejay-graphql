import MockDate from 'mockdate'

import spotify from '../../services/spotify'
import { resolvers } from '../resolvers'

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
          await resolvers.Query.room(null, { roomName: 'testz' })
        } catch (e) {
          expect(e.message).toMatch(/Room does not exist/)
        }
      })

      it('finds one room using id', () => {
        resolvers.Mutation.addRoom(null, { roomName: 'test' })

        expect(resolvers.Query.room(null, { name: 'test' })).toMatchSnapshot()
      })
    })
  })

  describe('Mutations', () => {
    describe('#queueTrack', () => {
      it('throws an error if no room is found', async () => {
        try {
          const input = {
            roomName: 'testz',
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
            roomName: 'test',
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
            roomName: 'test',
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

    describe('#nextTrack', () => {
      it('throws an error if no room is found', async () => {
        try {
          const input = {
            roomName: 'testz'
          }

          await resolvers.Mutation.nextTrack(null, input)
        } catch (e) {
          expect(e.message).toMatch(/Room does not exist/)
        }
      })
    })

    describe('#joinRoom', () => {
      afterEach(() => {
        MockDate.reset()
      })

      it('throws an error if no room is found', async () => {
        try {
          const input = {
            roomName: 'test',
            email: 'cookie@monster.com'
          }

          await resolvers.Mutation.joinRoom(null, { input })
        } catch (e) {
          expect(e.message).toMatch(/Room does not exist/)
        }
      })

      it('returns the updated room', async () => {
        MockDate.set('2017-09-20')

        try {
          const input = {
            roomName: 'test',
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
