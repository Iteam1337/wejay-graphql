import MockDate from 'mockdate'

import Timer from '../../utils/Timer'
import Room from '../Room'

jest.mock('../../utils/Timer', () =>
  jest.fn(() => ({
    stop: jest.fn()
  }))
)

describe('Room', () => {
  let room

  beforeEach(() => {
    room = new Room('test', '1')

    Timer.mockClear()
  })

  afterEach(() => {
    MockDate.reset()
  })

  it('can create a Room', () => {
    expect(room).toMatchSnapshot()
  })

  describe('#join', () => {
    it('pushes a new user', () => {
      room.join({ email: 'cookie@monster.com' })

      expect(room.users).toMatchSnapshot()
    })

    it('adds the user to userSongs', () => {
      room.join({ email: 'cookie@monster.com', id: 'test' })

      expect(room.userSongs.test).toBeDefined()
    })
  })

  describe('#queueTrack', () => {
    it('queues a track', () => {
      room.currentTrack = { name: 'test' }
      room.userSongs = {
        '1337': []
      }

      room.queueTrack({ name: 'test', user: '1337' })

      expect(room.queue).toMatchSnapshot()
    })

    it('adds the track to userSongs', () => {
      room.currentTrack = { name: 'test' }
      room.userSongs = {
        '1337': []
      }

      room.queueTrack({ name: 'test', user: '1337' })

      expect(room.userSongs).toMatchSnapshot()
    })

    it('calls next if no current track', () => {
      room.currentTrack = null
      room.userSongs = {
        '1337': []
      }

      MockDate.set('2017-09-20')

      room.queueTrack({ name: 'test', user: '1337' })

      expect(room.currentTrack).toEqual({
        name: 'test',
        started: '2017-09-20T00:00:00.000Z',
        user: '1337'
      })
    })
  })

  describe('#next', () => {
    it('removes any set timers', () => {
      room.timer = new Timer()

      room.next()

      expect(room.timer.stop).toHaveBeenCalled()
    })

    it('removes current track and sends it to history', () => {
      MockDate.set('2017-09-20')

      room.currentTrack = { name: 'test', user: '1337' }
      room.users = [{ id: '1337' }]

      room.next()

      expect(room.history).toEqual([{ name: 'test', user: '1337' }])
      expect(room.currentTrack).toBeNull()
      expect(room.users[0].lastPlay).toEqual('2017-09-20T00:00:00.000Z')
    })

    it('sets the first item in the list as current', () => {
      MockDate.set('2017-09-20')
      room.queue = [
        {
          duration: 100,
          name: 'test'
        }
      ]

      room.next()

      expect(room.currentTrack).toEqual({
        duration: 100,
        name: 'test',
        started: '2017-09-20T00:00:00.000Z'
      })
    })

    it('removes first track in queue', () => {
      room.queue = [
        {
          duration: 100,
          name: 'test'
        }
      ]

      room.next()

      expect(room.queue).toEqual([])
    })

    it('sets a Timer', () => {
      room.queue = [
        {
          duration: 100,
          name: 'test'
        }
      ]

      room.next()

      expect(Timer.mock.calls[0][1]).toEqual(100)
    })

    it('does not set a Timer if no current track duration', () => {
      room.queue = [
        {
          name: 'test'
        }
      ]

      room.next()

      expect(Timer).not.toHaveBeenCalled()
    })
  })
})
