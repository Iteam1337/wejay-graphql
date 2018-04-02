const constructAlbum = album => {
  return `
    MERGE (Album:Album {
      name: "${album.name}",
      id: '${album.id}',
      released: '${album.release_date}',
      uri: '${album.uri}',
      cover: '${album.images[0].url}'
    })

    ${album.artists
      .map(
        (artist, i) => `
        MERGE (AlbumArtist${i}:Artist {
          name: "${artist.name}",
          id: '${artist.id}',
          uri: '${artist.uri}'
        })

        MERGE (AlbumArtist${i})-[:CREATED_ALBUM]->(Album)   
      `
      )
      .join('')}
  `
}

export const queueTrack = async (track, email, context) => {
  const session = context.driver.session()

  const query = `
    ${constructAlbum(track.album)} 
  
    MERGE (Track:Song {
      name: "${track.name}",
      duration: ${track.duration_ms},
      explicit: ${track.explicit},
      id: '${track.id}',
      popularity: ${track.popularity},
      uri: '${track.uri}'
    })

    ${track.artists
      .map(
        (artist, i) => `
        MERGE (Artist${i}:Artist {
          name: "${artist.name}",
          id: '${artist.id}',
          uri: '${artist.uri}'
        })

        MERGE (Artist${i})-[:CREATED_TRACK]->(Track)
      `
      )
      .join('')}

    MERGE (Track)-[:ON_ALBUM { track: ${track.track_number} }]->(Album)
    
    MERGE (User:User { email: '${email}' })
    MERGE (User)-[listen:LISTENED_TO]->(Track)
    SET listen.count = CASE WHEN listen.count IS NULL THEN 1 ELSE listen.count + 1 END
  `

  await session.run(query)
  session.close()
}
