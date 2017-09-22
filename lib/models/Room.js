import pubsub from '../services/pubsub'
import Timer from '../utils/Timer'
import weave from '../utils/weave'

export default class Room {
  constructor(name, id) {
    this.name = name
    this.users = []
    this.queue = []
    this.id = id
    this.userSongs = {}
    this.currentTrack = null
    this.timer = null
  }

  startTimer() {
    if (!this.currentTrack || !this.currentTrack.duration) {
      return false
    }

    pubsub.publish('onNextTrack', {
      roomName: this.name,
      onNextTrack: this.currentTrack
    })

    pubsub.publish('queueUpdated', {
      roomName: this.name,
      queueUpdated: this.queue
    })

    // keep track on the song length and automatically switch to next when the song ends
    this.timer = new Timer(() => {
      this.next()
    }, this.currentTrack.duration)
  }

  join(user) {
    this.users.push(user)
    this.userSongs[user.id] = []
  }

  createQueue() {
    const songs = this.users
      .sort((a, b) => (a.lastPlay || 0) - (b.lastPlay || 0))
      .map(user => {
        const userSongs = this.userSongs[user.id]

        if (userSongs && userSongs.length) {
          return userSongs
            .map(song => {
              return Object.assign(song, { user })
            })
            .filter(song => {
              if (this.currentTrack) {
                return song.spotifyUri !== this.currentTrack.spotifyUri
              }

              return song
            })
        }

        return []
      })

    return weave(songs) || []
  }

  queueTrack(track) {
    this.userSongs[track.user].push(track)

    this.queue = this.createQueue()

    pubsub.publish('queueUpdated', {
      roomName: this.name,
      queueUpdated: this.queue
    })

    if (!this.currentTrack) {
      this.next()
    }
  }

  next() {
    if (this.timer) {
      this.timer.stop()
    }

    if (this.currentTrack) {
      const currentUser = this.users.find(
        user => user.id === this.currentTrack.user.id
      )

      currentUser.lastPlay = Date.now()

      this.currentTrack = null
    }

    if (this.queue.length) {
      this.currentTrack = this.queue[0]
      this.currentTrack.started = Date.now()
      this.queue = this.queue.slice(1)

      this.startTimer()
    }
  }
}
