export function getAnimeByIdQuery() {
    return `
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title {
              english
              romaji
              native
            }
            episodes
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            genres
            averageScore
            coverImage {
              large
            }
            bannerImage
            description(asHtml: true)
            characters(sort: [ROLE]) {
              edges {
                role
                node {
                  id
                  name {
                    full
                    native
                  }

                  image {
                    large
                  }
                }
              }
            }
          }
        }
    `
}