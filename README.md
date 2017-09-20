# wejay-graphql

### Example queries

```graphql
query rooms {
  rooms {
    id
    name
    queue {
      ...track
    }
  }
}

mutation queue($queueInput: QueueInput!) {
  queueTrack(input: $queueInput) {
    ...track
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
}
```
