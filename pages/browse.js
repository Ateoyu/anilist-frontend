import { browsePageQuery} from "../queries/browsePageQuery.js";

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

    const allGenresQuery =
        `
        query {
            GenreCollection
        }
        `


    const query = browsePageQuery();

    let variables = {};
    let currentPage = 1;
    let hasNextPage = true;
    let isLoading = false;
    const intersectionObserver = new IntersectionObserver(loadMoreAnimeData)

    setupFilterEventListeners();

    function loadGenreSelectOptions() {
        $.post({
            url: 'https://graphql.anilist.co',
            contentType: 'application/json',
                data: JSON.stringify({ query: allGenresQuery }),
            success: function (response) {
                console.log("Loaded genre options.");
                response.data.GenreCollection.forEach(genre => {
                    $("#animeGenreSelect").append(`<option value="${genre}">${genre}</option>`);
                });
            },
            error: function (err) {
                console.error("Error loading genre options:", err);
            }
        });
    }

    loadGenreSelectOptions();
    loadAnimeData();

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
        setFilterVariableIfValid(variables, 'search', searchValue);
        setFilterVariableIfValid(variables, 'genres', genreValue, (value) => [value]);
        setFilterVariableIfValid(variables, 'seasonYear', yearValue, (value) => parseInt(value));
        setFilterVariableIfValid(variables, 'season', seasonValue, (value) => value.toUpperCase());

        currentPage = 1;
        loadAnimeData();
    }

    // Update variables object
    function setFilterVariableIfValid(variablesObject, key, value, transform = (v) => v) {
        if (value && value !== "") {
            variablesObject[key] = transform(value);
        } else {
            delete variablesObject[key];
        }
    }

    // Based on the window width and height, set the perPage variable to optimise the network request size and frequency.
    function setPerPageVarFromWindowSize(innerWidth, innerHeight) {
        if (innerHeight > 600) {
            switch (true) {
                case (innerWidth >= 1536): return 50;
                case (innerWidth >= 1280 && innerWidth < 1536): return 40;
                case (innerWidth >= 1024 && innerWidth < 1280): return 30;
                default: return 20;
            }
        }
        return 20;
    }

    function loadAnimeData() {
        isLoading = true;
        variables.page = 1;
        variables.perPage = setPerPageVarFromWindowSize(window.innerWidth, window.innerHeight);
        currentPage = 1;
        console.log("Loading anime data...");

        // Show loading indicator
        const $animeGrid = $('#animeGridContainer');
        $animeGrid.html('<div class="loading-indicator">Loading anime...</div>');

        $.post({
            url: 'https://graphql.anilist.co',
            contentType: 'application/json',
            data: JSON.stringify({query, variables}),
            success: function(response) {
                displayAnimeData(response, false);
                isLoading = false;
            },
            error: function (err) {
                console.error("Error loading anime data:", err);
                $animeGrid.html('<div class="no-results">Error loading anime data. Please try again later.</div>');
                isLoading = false;
            }
        });
    }

    function displayAnimeData(animeList, isAppending) {
        const $animeGrid = $('#animeGridContainer');

        // Update hasNextPage flag based on API response
        hasNextPage = animeList.data.Page.pageInfo.hasNextPage;

        // Remove any existing loading indicator
        $('.loading-indicator').remove();

        // If this is a fresh load (not appending), clear the grid first
        if (!isAppending) {
            $animeGrid.empty();
        }

        // If no more pages or no results, show a message
        if (animeList.data.Page.media.length === 0 && !isAppending) {
            $animeGrid.html('<div class="no-results">No anime found matching your criteria.</div>');
            return;
        }

        // Append anime cards to the grid
        for (const anime of animeList.data.Page.media) {
            const id = anime.id;
            const coverImage = anime.coverImage.large;
            const title = anime.title.english ?? anime.title.romaji;

            const animeCard = `
                <div class="animeCard" data-link href="/anime/${id}">
                    <div class="animeCoverImgContainer">
                        <img src="${coverImage}" alt="anime cover image">
                    </div>
                    <div class="animeTextContainer">
                        <h2>${title}</h2>
                    </div>
                </div>`;

            $animeGrid.append(animeCard);
        }

        // Add a loading indicator if there are more pages
        if (hasNextPage) {
            $animeGrid.append('<div class="loading-indicator">Loading more...</div>');
            setupInfiniteScroll($('.loading-indicator')[0]);
        }

        // If we've loaded all pages, add an end message
        if (!hasNextPage && isAppending) {
            $animeGrid.append('<div class="no-results">You\'ve reached the end!</div>');
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

    function setupInfiniteScroll(triggerElement) {
        intersectionObserver.observe(triggerElement);
    }

    function loadMoreAnimeData(trigger) {
        if (isLoading || !hasNextPage) return;
        if (trigger[0].isIntersecting) {
            isLoading = true;
            currentPage++;
            variables.page = currentPage;
            console.log(`Loading more anime data (page ${currentPage})...`);

            $.post({
                url: 'https://graphql.anilist.co',
                contentType: 'application/json',
                data: JSON.stringify({query, variables}),
                success: function(response) {
                    displayAnimeData(response, true);
                    isLoading = false;
                },
                error: function(err) {
                    console.error("Error loading more anime data:", err);
                    isLoading = false;
                    currentPage--; // Revert page increment on error
                }
            });
        }
    }
}
