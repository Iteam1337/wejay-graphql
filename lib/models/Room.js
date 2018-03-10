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

    // keep track on the song length and automatically switch to next when the song ends
    this.timer = new Timer(() => {
      this.next()
    }, this.currentTrack.duration)
  }

  pause() {
    this.timer.pause()
  }

  play() {
    this.timer.resume()
  }

  join(user) {
    this.users.push(user)
    this.userSongs[user.id] = []
  }

  pruneUsers() {
    this.users = this.users.filter(user => {
      if (user.lastPlay === 0) {
        return true
      }

      return Date.now() - user.lastPlay < 1000 * 60 * 60
    })
  }

  createQueue() {
    const songs = this.users
      .sort((a, b) => (a.lastPlay || 0) - (b.lastPlay || 0))
      .map(user => {
        const userSongs = this.userSongs[user.id]

        if (userSongs && userSongs.length) {
          return userSongs
            .map(song => Object.assign(song, { user }))
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
    this.pruneUsers()

    if (!this.currentTrack) {
      this.next()
    }
  }

  next() {
    this.pruneUsers()

    if (this.timer) {
      this.timer.stop()
    }

    if (this.currentTrack) {
      this.userSongs[this.currentTrack.user.id] = this.userSongs[
        this.currentTrack.user.id
      ].filter(song => song.spotifyUri !== this.currentTrack.spotifyUri)

      this.currentTrack = null
    }

    if (this.queue.length) {
      this.currentTrack = this.queue[0]
      this.currentTrack.started = Date.now()
      this.queue = this.queue.slice(1)

      const currentUser = this.users.find(
        user => user.id === this.currentTrack.user.id
      )

      currentUser.lastPlay = Date.now()

      this.startTimer()
    }

    pubsub.publish('roomUpdated', {
      roomName: this.name,
      roomUpdated: {
        id: this.id,
        currentTrack: this.currentTrack,
        name: this.name,
        queue: this.queue,
        users: this.users
      }
    })
  }
}
