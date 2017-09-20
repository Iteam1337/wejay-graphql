import Room from '../Room'
import Timer from '../../utils/Timer'

jest.mock('../../utils/Timer', () =>
  jest.fn(() => ({
    stop: jest.fn()
  }))
)

describe('Room', () => {
  let room

  beforeEach(() => {
    room = new Room('test', '1')
  })

  it('can create a Room', () => {
    expect(room).toMatchSnapshot()
  })

  describe('#join', () => {
    it('pushes a new user', () => {
      room.join({ email: 'cookie@monster.com' })

      expect(room.users).toMatchSnapshot()
    })
  })

  describe('#queueTrack', () => {
    it('queues a track', () => {
      room.queueTrack({ name: 'test' })

      expect(room.queue).toMatchSnapshot()
    })
  })

  describe('#next', () => {
    it('removes any set timers', () => {
      room.timer = new Timer()

      room.next()

      expect(room.timer.stop).toHaveBeenCalled()
    })
  })
})
