import MockDate from 'mockdate'
import pubsub from '../../services/pubsub'

import Timer from '../../utils/Timer'
import Room from '../Room'

jest.mock('../../utils/Timer', () =>
  jest.fn(() => ({
    stop: jest.fn()
  }))
)

jest.mock('../../services/pubsub', () => ({
  publish: jest.fn()
}))

describe('Room', () => {
  let room

  beforeEach(() => {
    room = new Room('test', '1')

    Timer.mockClear()
    pubsub.publish.mockClear()
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

  describe('#createQueue', () => {
    it('returns a weaved queue', () => {
      room.users = [
        {
          id: '1337',
          lastPlay: 1505865600000
        },
        {
          id: '1338',
          lastPlay: 1505865600001
        }
      ]
      room.userSongs = {
        1337: [
          {
            name: 'first'
          },
          {
            name: 'third'
          }
        ],
        1338: [{ name: 'second' }]
      }

      const queue = room.createQueue()

      expect(queue).toMatchSnapshot()
    })

    it('filters out currentTrack if any', () => {
      room.currentTrack = { spotifyUri: '1' }
      room.users = [
        {
          id: '1337',
          lastPlay: 1505865600000
        },
        {
          id: '1338',
          lastPlay: 1505865600001
        }
      ]
      room.userSongs = {
        1337: [
          {
            name: 'first',
            spotifyUri: '12'
          },
          {
            name: 'third',
            spotifyUri: '11'
          }
        ],
        1338: [
          { name: 'second', spotifyUri: '13' },
          { name: 'not-included', spotifyUri: '1' }
        ]
      }

      const queue = room.createQueue()

      expect(queue).toMatchSnapshot()
    })
  })

  describe('#queueTrack', () => {
    it('queues a track', () => {
      room.currentTrack = { name: 'test', spotifyUri: '1' }
      room.users = [
        {
          id: '1337',
          lastPlay: 1
        }
      ]
      room.userSongs = {
        '1337': []
      }

      room.queueTrack({ name: 'test', user: '1337', spotifyUri: '2' })

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

    it('publishes the new queue', () => {
      room.currentTrack = { name: 'test' }
      room.userSongs = {
        '1337': []
      }

      room.queueTrack({ name: 'test', user: '1337' })

      expect(pubsub.publish).toHaveBeenCalledWith('queueUpdated', {
        roomName: 'test',
        queueUpdated: []
      })
    })

    it('calls next if no current track', () => {
      room.currentTrack = null
      room.users = [
        {
          id: '1337',
          lastPlay: 1
        }
      ]
      room.userSongs = {
        '1337': []
      }

      MockDate.set('2017-09-20')

      room.queueTrack({ name: 'test', user: '1337' })

      expect(room.currentTrack).toEqual({
        name: 'test',
        started: 1505865600000,
        user: {
          id: '1337',
          lastPlay: 1505865600000
        }
      })
      expect(room.queue).toEqual([])
    })
  })

  describe('#next', () => {
    it('removes any set timers', () => {
      room.timer = new Timer()

      room.next()

      expect(room.timer.stop).toHaveBeenCalled()
    })

    it('sets the first item in the list as current', () => {
      MockDate.set('2017-09-20')
      room.users = [{ name: 'test', id: '1337' }]
      room.queue = [
        {
          duration: 100,
          name: 'test',
          user: {
            id: '1337'
          }
        }
      ]

      room.next()

      expect(room.currentTrack).toEqual({
        duration: 100,
        name: 'test',
        started: 1505865600000,
        user: {
          id: '1337'
        }
      })
    })

    it('removes the song from the users songs', () => {
      room.userSongs = { '1337': [{ spotifyUri: '1' }] }
      room.currentTrack = { spotifyUri: '1', user: { id: '1337' } }
      room.users = [{ name: 'test', id: '1337' }]

      room.next()

      expect(room.userSongs['1337']).toEqual([])
    })

    it('removes first track in queue', () => {
      room.queue = [
        {
          duration: 100,
          name: 'test',
          user: {
            id: '1337'
          }
        }
      ]
      room.users = [{ name: 'test', id: '1337' }]

      room.next()

      expect(room.queue).toEqual([])
    })

    it('sets a Timer', () => {
      room.currentTrack = { spotifyUri: '1', user: { id: '1337' } }
      room.userSongs = { '1337': [] }
      room.queue = [
        {
          duration: 100,
          name: 'test',
          user: {
            id: '1337'
          }
        }
      ]
      room.users = [{ name: 'test', id: '1337' }]

      room.next()

      expect(Timer.mock.calls[0][1]).toEqual(100)
    })

    it('does not set a Timer if no current track duration', () => {
      room.currentTrack = { spotifyUri: '1', user: { id: '1337' } }
      room.userSongs = { '1337': [] }
      room.queue = [
        {
          name: 'test',
          user: {
            id: '1337'
          }
        }
      ]
      room.users = [{ name: 'test', id: '1337' }]

      room.next()

      expect(Timer).not.toHaveBeenCalled()
    })
  })
})
