import {browsePageQuery} from "../queries/browsePageQuery.js";

export function renderBrowse() {
    const $app = $('#app');

    // language=HTML
    $app.html(`
        <div id="widthLimiterBrowse">
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
        </div>
    `);

    const allGenresQuery = `
      query {
        GenreCollection
      }
    `;

    const query = browsePageQuery();

    let variables = {};
    let currentPage = 1;
    let hasNextPage = true;
    let isLoading = false;
    const intersectionObserver = new IntersectionObserver(loadMoreAnimeData);

    // Initialize the page
    initializePage();

    //todo: cache the API responses to avoid excess API calls.

    // function loadCachedData() {
    //     const cachedAnime = localStorage.getItem(ANIME_DATA_KEY);
    //     const cachedScrollPosition = localStorage.getItem(SCROLL_POSITION_KEY);
    //     const cachedGenres = localStorage.getItem(GENRES_KEY);
    //
    //     if (cachedAnime) {
    //
    //     }
    // }

    function initializePage() {
        setupFilterEventListeners();

        const genresLoaded = loadGenreSelectOptions();
        const yearsLoaded = loadYearSelectOptions();

        // Wait for all options to load, then apply filters and load data
        Promise.all([genresLoaded, yearsLoaded])
            .then(() => {
                loadFiltersFromUrl();
                loadAnimeData();
            })
            .catch(error => {
                console.error("Error initializing page:", error);
            });
    }

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

    function loadGenreSelectOptions() {
        return new Promise((resolve, reject) => {
            $.post({
                url: 'https://graphql.anilist.co',
                contentType: 'application/json',
                data: JSON.stringify({query: allGenresQuery}),
                success: function (response) {
                    console.log("Loaded genre options.");
                    response.data.GenreCollection.forEach(genre => {
                        $("#animeGenreSelect").append(`<option value="${genre}">${genre}</option>`);
                    });
                    resolve();
                },
                error: function (err) {
                    console.error("Error loading genre options:", err);
                    reject(err);
                }
            });
        });
    }

    function loadYearSelectOptions() {
        return new Promise((resolve) => {
            const $yearSelect = $("#animeYearSelect");
            for (let year = 2025; year >= 1970; year--) {
                $yearSelect.append(`<option value="${year}">${year}</option>`);
            }

            console.log(`Loaded year options from ${2025} to ${1970}.`);
            resolve();
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
        setFilterVariableIfValid(variables, 'genre', genreValue);
        setFilterVariableIfValid(variables, 'seasonYear', yearValue, (value) => parseInt(value));
        setFilterVariableIfValid(variables, 'season', seasonValue, (value) => value.toUpperCase());

        // Update URL with current filter values
        updateUrlWithFilters(searchValue, genreValue, yearValue, seasonValue);

        currentPage = 1;
        loadAnimeData();
    }

    function updateUrlWithFilters(search, genre, year, season) {
        const url = new URL(window.location.href);

        // Clear existing parameters
        url.search = '';

        // Add parameters if they have values
        if (search) url.searchParams.set('search', search);
        if (genre) url.searchParams.set('genre', genre);
        if (year) url.searchParams.set('year', year);
        if (season) url.searchParams.set('season', season);

        // Update the URL without reloading the page
        window.history.pushState({}, '', url);
    }

    function loadFiltersFromUrl() {
        const url = new URL(window.location.href);

        const search = url.searchParams.get('search');
        const genre = url.searchParams.get('genre');
        const year = url.searchParams.get('year');
        const season = url.searchParams.get('season');

        if (search) $("#animeSearchInput").val(search);

        if (genre) {
            const $genreSelect = $("#animeGenreSelect");
            if ($genreSelect.find(`option[value="${genre}"]`).length > 0) {
                $genreSelect.val(genre);
            }
        }

        if (year) {
            const $yearSelect = $("#animeYearSelect");
            if ($yearSelect.find(`option[value="${year}"]`).length > 0) {
                $yearSelect.val(year);
            }
        }

        if (season) {
            const $seasonSelect = $("#animeSeasonSelect");
            if ($seasonSelect.find(`option[value="${season}"]`).length > 0) {
                $seasonSelect.val(season);
            }
        }

        setFilterVariableIfValid(variables, 'search', search);
        setFilterVariableIfValid(variables, 'genre', genre);
        setFilterVariableIfValid(variables, 'seasonYear', year, (value) => parseInt(value));
        setFilterVariableIfValid(variables, 'season', season, (value) => value.toUpperCase());
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
                case (innerWidth >= 1536):
                    return 50;
                case (innerWidth >= 1280 && innerWidth < 1536):
                    return 40;
                case (innerWidth >= 1024 && innerWidth < 1280):
                    return 30;
                default:
                    return 20;
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
            success: function (response) {
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

    function loadMoreAnimeData(trigger) {
        if (isLoading || !hasNextPage) {
            return;
        }
        if (trigger[0].isIntersecting) {
            isLoading = true;
            currentPage++;
            variables.page = currentPage;
            console.log(`Loading more anime data (page ${currentPage})...`);

            $.post({
                url: 'https://graphql.anilist.co',
                contentType: 'application/json',
                data: JSON.stringify({query, variables}),
                success: function (response) {
                    displayAnimeData(response, true);
                    isLoading = false;
                },
                error: function (err) {
                    console.error("Error loading more anime data:", err);
                    isLoading = false;
                    currentPage--; // Revert page increment on error
                }
            });
        }
    }

    function displayAnimeData(animeList, isAppending) {
        const $animeGrid = $('#animeGridContainer');
        hasNextPage = animeList.data.Page.pageInfo.hasNextPage;
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

            // Store the cover image URL in sessionStorage for reuse in anime view
            sessionStorage.setItem(`anime-cover-${id}`, coverImage);

            const animeCard = `
                <div class="animeCard" data-link href="/anime/${id}">
                    <div class="animeCoverImgContainer" style="view-transition-name: anime-cover-${id};">
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

        // If loaded all pages, add an end message
        if (!hasNextPage && isAppending) {
            $animeGrid.append(`<div class="no-results">You've reached the end!</div>`);
        }
    }

    function setupInfiniteScroll(triggerElement) {
        intersectionObserver.observe(triggerElement);
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
