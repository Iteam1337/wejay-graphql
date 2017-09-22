import MockDate from 'mockdate'
import spotify from '../../services/spotify'
import pubsub from '../../services/pubsub'
import { resolvers } from '../resolvers'
import { spotifyParser, getRoom } from '../../utils/helpers'
import md5 from 'md5'

jest.mock('../../services/spotify', () => ({
  getTrack: jest.fn()
}))

jest.mock('../../services/pubsub', () => ({
  publish: jest.fn()
}))

jest.mock('uuid/v4', () => jest.fn(() => '1'))
jest.mock('md5', () => jest.fn(() => 'md5'))

jest.mock('../../utils/helpers', () => ({
  spotifyParser: jest.fn().mockReturnValue('spotifyId'),
  getRoom: jest.fn().mockReturnValue({
    currentTrack: null,
    id: '1',
    name: 'test',
    queue: [],
    timer: null,
    userSongs: {},
    users: [],
    queueTrack: jest.fn(),
    join: jest.fn(),
    next: jest.fn()
  })
}))

describe('resolvers', () => {
  beforeEach(() => {
    spotifyParser.mockClear()
    getRoom.mockClear()
    getRoom().join.mockClear()
  })

  describe('Query', () => {
    describe('#rooms', () => {
      it('returns current rooms', () => {
        expect(resolvers.Query.rooms()).toMatchSnapshot()
      })
    })

    describe('#room', () => {
      it('finds one room using name', () => {
        expect(resolvers.Query.room(null, { name: 'test' })).toMatchSnapshot()
      })
    })
  })

  describe('Mutations', () => {
    describe('#queueTrack', () => {
      let input

      beforeEach(() => {
        input = {
          roomName: 'test',
          spotifyId: 'spotify:track:6Inmo6ElDCaiZCiB6lficH',
          userId: '1337'
        }
      })

      it('parses the spotifyId', async () => {
        try {
          spotify.getTrack.mockImplementationOnce(() =>
            Promise.resolve({ body: {} })
          )

          await resolvers.Mutation.queueTrack(null, { input })

          expect(spotifyParser).toHaveBeenCalledWith(input.spotifyId)
        } catch (e) {
          throw new Error(e)
        }
      })

      it('gets the room', async () => {
        try {
          spotify.getTrack.mockImplementationOnce(() =>
            Promise.resolve({ body: {} })
          )

          await resolvers.Mutation.queueTrack(null, { input })

          expect(getRoom).toHaveBeenCalledWith([], input.roomName)
        } catch (e) {
          throw new Error(e)
        }
      })

      it('gets the track information from the Spotify API', async () => {
        try {
          spotify.getTrack.mockImplementationOnce(() =>
            Promise.resolve({ body: {} })
          )

          await resolvers.Mutation.queueTrack(null, { input })

          expect(spotify.getTrack).toHaveBeenCalledWith('spotifyId')
        } catch (e) {
          throw new Error(e)
        }
      })

      it('throws already playing if track is the current', async () => {
        expect.hasAssertions()

        try {
          getRoom.mockReturnValueOnce({
            currentTrack: { spotifyUri: '6Inmo6ElDCaiZCiB6lficH' },
            id: '1',
            name: 'test',
            queue: [],
            timer: null,
            userSongs: {},
            users: [],
            queueTrack: jest.fn(),
            join: jest.fn(),
            next: jest.fn()
          })

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

          await resolvers.Mutation.queueTrack(null, { input })
        } catch (e) {
          expect(e.message).toMatch(/Already playing/)
        }
      })

      it('throws already in queue if track is queued', async () => {
        expect.hasAssertions()

        try {
          getRoom.mockReturnValueOnce({
            currentTrack: null,
            id: '1',
            name: 'test',
            queue: [{ spotifyUri: '6Inmo6ElDCaiZCiB6lficH' }],
            timer: null,
            userSongs: {},
            users: [],
            queueTrack: jest.fn(),
            join: jest.fn(),
            next: jest.fn()
          })

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

          await resolvers.Mutation.queueTrack(null, { input })
        } catch (e) {
          expect(e.message).toMatch(/Already in queue/)
        }
      })

      it('calls queueTrack on the Room', async () => {
        try {
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

          await resolvers.Mutation.queueTrack(null, { input })

          expect(getRoom().queueTrack).toHaveBeenCalledWith({
            album: {
              name: 'albumname'
            },
            artists: [{ name: 'artist' }],
            duration: 30000,
            name: 'track',
            spotifyUri: '6Inmo6ElDCaiZCiB6lficH',
            user: '1337'
          })
        } catch (e) {
          throw new Error(e)
        }
      })

      it('returns the new track', async () => {
        try {
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
      it('gets the room', () => {
        resolvers.Mutation.nextTrack(null, { roomName: 'test' })

        expect(getRoom).toHaveBeenCalledWith(
          [
            {
              currentTrack: null,
              id: '1',
              name: 'newRoom',
              queue: [],
              timer: null,
              userSongs: {},
              users: []
            }
          ],
          'test'
        )
      })

      it('calls next on the Room', () => {
        resolvers.Mutation.nextTrack(null, { roomName: 'test' })

        expect(getRoom().next).toBeCalled()
      })

      it('returns the room', () => {
        const room = resolvers.Mutation.nextTrack(null, { roomName: 'test' })

        expect(room).toMatchSnapshot()
      })
    })

    describe('#joinRoom', () => {
      let input

      beforeEach(() => {
        input = {
          roomName: 'test',
          email: 'cookie@monster.com'
        }
      })

      afterEach(() => {
        MockDate.reset()
      })

      it('gets the room', () => {
        resolvers.Mutation.joinRoom(null, { input })

        expect(getRoom).toHaveBeenCalledWith(
          [
            {
              currentTrack: null,
              id: '1',
              name: 'newRoom',
              queue: [],
              timer: null,
              userSongs: {},
              users: []
            }
          ],
          'test'
        )
      })

      it('hashes the email', () => {
        resolvers.Mutation.joinRoom(null, { input })

        expect(md5).toHaveBeenCalledWith('cookie@monster.com')
      })

      it('just returns room if already logged in', () => {
        getRoom.mockReturnValueOnce({
          currentTrack: null,
          id: '1',
          name: 'test',
          queue: [],
          timer: null,
          userSongs: {},
          users: [{ id: 'md5' }],
          queueTrack: jest.fn(),
          join: jest.fn(),
          next: jest.fn()
        })

        const updatedRoom = resolvers.Mutation.joinRoom(null, { input })

        expect(getRoom().join).not.toBeCalled()
        expect(updatedRoom).toMatchSnapshot()
      })

      it('calls join on the Room', () => {
        resolvers.Mutation.joinRoom(null, { input })

        expect(getRoom().join).toHaveBeenCalledWith({
          email: 'cookie@monster.com',
          id: 'md5',
          lastPlay: 0
        })
      })

      it('returns the updated room', () => {
        MockDate.set('2017-09-20')

        resolvers.Mutation.addRoom(null, { roomName: 'test' })

        const updatedRoom = resolvers.Mutation.joinRoom(null, { input })

        expect(updatedRoom).toMatchSnapshot()
      })
    })
  })
})
