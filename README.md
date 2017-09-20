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

mutation nextTrack($roomName: String!) {
  nextTrack(roomName: $roomName) {
    name
  }
}

fragment track on Track {
  duration
  name
  spotifyUri
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
}
```

```
{
  "roomName": "test",
  "queueInput": {
    "roomName": "test",
    "spotifyId": "spotify:track:2ggprihMBKOdtCUAGItJiK"
  }
}
```
