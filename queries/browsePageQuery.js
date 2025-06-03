export function browsePageQuery() {
    return `
        query (
          $page: Int = 1
          $perPage: Int
          $search: String
          $season: MediaSeason
          $seasonYear: Int
          $genre: String
          $isAdult: Boolean = false
        ) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              hasNextPage
            }
            media(
              type: ANIME
              search: $search
              season: $season
              seasonYear: $seasonYear
              genre: $genre
              isAdult: $isAdult
              sort: [POPULARITY_DESC, SCORE_DESC]
            ) {
              id
              title {
                english
                romaji
              }
              coverImage {
                large
              }
              seasonYear
              season
              genres
              averageScore
            }
          }
        }
`
}