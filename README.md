# wejay-graphql

### Example queries

```graphql
query rooms {
  rooms {
    ...room
  }
}

mutation queue($queueInput: QueueInput!) {
  queueTrack(input: $queueInput) {
    ...track
  }
}

mutation addRoom($roomName: String!) {
  addRoom(roomName: $roomName) {
    ...room
  }
}

mutation joinRoom($joinInput: JoinRoomInput!) {
  joinRoom(input: $joinInput) {
    ...room
  }
}

fragment track on Track {
  album {
    images {
      height
      url
      width
    }
    name
    uri
  }
  artists {
    name
    uri
  }
  duration
  name
  spotifyUri
  user
}

fragment room on Room {
  id
  currentTrack {
    ...track
  }
  name
  queue {
    ...track
  }
  users {
    id
    email
  }
}

```

```
{
  "roomName": "test",
  "queueInput": {
    "roomName": "test",
    "spotifyId": "spotify:track:7DFE2jF0qZUXIcFthEjrgJ",
    "userId": "01ba46cb8ee556f83c580648547e0fbc"
  },
  "joinInput": {
    "roomName": "test",
    "email": "email"
  }
}
```
