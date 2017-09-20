import Timer from '../utils/Timer'

export default class Room {
  constructor(name, id) {
    this.name = name
    this.users = []
    this.queue = []
    this.id = id
    this.currentTrack = null
    this.history = []
    this.timer = null
  }

  startTimer() {
    if (!this.currentTrack || !this.currentTrack.duration) {
      return false
    }

    // keep track on the song length and automatically switch to next when the song ends
    this.timer = new Timer(() => {
      this.next()
    }, this.currentTrack.duration)
  }

  join(user) {
    this.users.push(user)
  }

  queueTrack(track) {
    this.queue.push(track)
  }

  next() {
    if (this.timer) {
      this.timer.stop()
    }

    if (this.currentTrack) {
      this.history.push(this.currentTrack)
      this.currentTrack = null
    }

    if (this.queue.length) {
      this.currentTrack = this.queue[0]
      this.currentTrack.started = new Date()
      this.queue = this.queue.slice(1)

      this.startTimer()
    } else {
      this.currentTrack = null
    }
  }
}
