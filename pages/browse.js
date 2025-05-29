export function renderBrowse() {
    const $app = $('#app');

    $app.html(`
        <div id="animeFilterContainer">
          <label>
            Search
            <input type="text" id="animeSearchInput" placeholder="Anime Title...">
          </label>
          <label>
            Genre
            <select id="animeGenreSelect">
              <!-- Filled with all possible genres by API request -->
              <option value="">All</option>
            </select>
          </label>
          <label>
            Release Year
            <select id="animeYearSelect">
              <!-- Filled with all possible release years by API request -->
              <option value="">All</option>
            </select>
          </label>
          <label>
            Season
            <select id="animeSeasonSelect">
              <option value="">All</option>
              <option value="Winter">Winter</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Fall">Fall</option>
            </select>
          </label>
        </div>
        <div id="animeGridContainer">
        <!-- Filled with AnimeCards by API request -->
    </div>
    `);

    const query = `
        query (
          $page: Int = 1
          $search: String
          $season: MediaSeason
          $seasonYear: Int
          $genre: String
          $isAdult: Boolean = false
        ) {
          Page(page: $page, perPage: 20) {
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
    `;


    let variables = {};
    let currentPage = 1;

    setupFilterEventListeners();

    function setupFilterEventListeners() {
        // Text search input (with debounce)
        $("#animeSearchInput").on('input', debounce(function () {
            updateFilters();
        }, 500));

        // Select dropdowns
        $("#animeGenreSelect, #animeYearSelect, #animeSeasonSelect").on('change', function () {
            updateFilters();
        });
    }

    function updateFilters() {
        // Get values from filters
        const searchValue = $("#animeSearchInput").val();
        const genreValue = $("#animeGenreSelect").val();
        const yearValue = $("#animeYearSelect").val();
        const seasonValue = $("#animeSeasonSelect").val();

        // Update variables object
        setVariableIfValid(variables, 'search', searchValue);
        setVariableIfValid(variables, 'genres', genreValue, (value) => [value]);
        setVariableIfValid(variables, 'seasonYear', yearValue, (value) => parseInt(value));
        setVariableIfValid(variables, 'season', seasonValue, (value) => value.toUpperCase());

        currentPage = 1;
        loadAnimeData();
    }

    // Update variables object
    function setVariableIfValid(variablesObject, key, value, transform = (v) => v) {
        if (value && value !== "") {
            variablesObject[key] = transform(value);
        } else {
            delete variablesObject[key];
        }
    }

    function loadAnimeData() {
        variables.page = 1;
        console.log("Loading anime data...");

        $.post({
            url: 'https://graphql.anilist.co',
            contentType: 'application/json',
            data: JSON.stringify({query, variables}),
            success: displayAnimeData,
            error: function (err) {
                console.error("Error loading anime data:", err);
            }
        });
    }

    function displayAnimeData(animeList) {
        const $animeGrid = $('#animeGridContainer');

        for (const anime of animeList.data.Page.media) {
            const id = anime.id;
            const coverImage = anime.coverImage.large;
            const title = anime.title.english ?? anime.title.romaji;

            const animeCard = `
                <div class="anime-card" data-link href="/anime/${id}">
                    <div class="animeCoverImgContainer">
                        <img src="${coverImage}" alt="anime cover image">
                    </div>
                    <div class="animeTextContainer">
                        <h2>${title}</h2>
                    </div>
                </div>`;

            $animeGrid.append(animeCard);
        }
    }


    // Utility function: debounce to prevent excessive function calls
    function debounce(func, wait) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
}
