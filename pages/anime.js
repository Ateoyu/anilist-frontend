import { getAnimeByIdQuery } from "../queries/getAnimeByIdQuery.js";

export function renderAnimeDetails(id) {
    const $app = $('#app');

    // Show loading indicator
    $app.html('<div class="loading-indicator">Loading anime details...</div>');

    const query = getAnimeByIdQuery();

    // Execute the GraphQL query
    $.post({
        url: 'https://graphql.anilist.co',
        contentType: 'application/json',
        data: JSON.stringify({
            query: query,
            variables: { id: parseInt(id) }
        }),
        success: function(response) {
            displayAnimeDetails(response.data.Media);
        },
        error: function(err) {
            console.error("Error loading anime details:", err);
            $app.html('<div class="error-message">Error loading anime details. Please try again later.</div>');
        }
    });

    function displayAnimeDetails(media) {
        // Prepare data for display
        const title = media.title.english || media.title.romaji;
        const nativeTitle = media.title.native;
        const romajiTitle = media.title.romaji;
        const coverImage = media.coverImage.large;
        const bannerImage = media.bannerImage;
        const description = media.description;
        const averageScore = media.averageScore;
        const episodes = media.episodes;

        // Format dates if available
        let startDate = '';
        if (media.startDate && media.startDate.day && media.startDate.month && media.startDate.year) {
            startDate = `${media.startDate.day}/${media.startDate.month}/${media.startDate.year}`;
        }

        let endDate = '';
        if (media.endDate && media.endDate.day && media.endDate.month && media.endDate.year) {
            endDate = `${media.endDate.day}/${media.endDate.month}/${media.endDate.year}`;
        }

        // Build HTML template
        $app.html(`
        <div id="bannerAndInfoWrapper">
            <div id="banner" style="background-image: url('${bannerImage}')"></div>

            <div id="info">
                <div class="infoContainer">
                    <div class="cover-wrap-overlap-banner">
                        <div class="cover-wrap-inner">
                            <img src="${coverImage}" class="cover-image" alt="coverImage">
                        </div>
                    </div>

                    <div class="content">
                        <h1>${title}</h1>
                        ${media.title.english && media.title.english !== media.title.romaji ? `<h2>${romajiTitle}</h2>` : ''}
                        ${nativeTitle ? `<h3>${nativeTitle}</h3>` : ''}
                        <p>${description}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="mediaDataContainer">
            <aside>
                <dl class="mediaData">
                    ${averageScore ? `
                    <div class="data avgScore">
                        <dt>Average Score</dt>
                        <dd>${averageScore}</dd>
                    </div>` : ''}
                    ${episodes ? `
                    <div class="data episodes">
                        <dt>Episodes</dt>
                        <dd>${episodes}</dd>
                    </div>` : ''}
                    ${startDate ? `
                    <div class="data starDate">
                        <dt>Start Date</dt>
                        <dd>${startDate}</dd>
                    </div>` : ''}
                    ${endDate ? `
                    <div class="data endDate">
                        <dt>End Date</dt>
                        <dd>${endDate}</dd>
                    </div>` : ''}
                </dl>
            </aside>
            <div class="mediaOverview">
                <div class="mediaCharacters">
                    <h2>Characters</h2>
                    <div class="mediaCharactersGridWrapper" id="charactersGrid">
                        <!-- Characters will be added here dynamically -->
                    </div>
                </div>
            </div>
        </div>
        `);

        // Add characters to the grid
        const $charactersGrid = $('#charactersGrid');
        if (media.characters && media.characters.edges && media.characters.edges.length > 0) {
            media.characters.edges.forEach(edge => {
                const character = edge.node;
                const characterId = character.id;
                const characterName = character.name.full || character.name.native;
                const characterNativeName = character.name.native;
                const characterImage = character.image.large;

                const characterElement = `
                <div class="characterDiv" data-link href="/character/${characterId}">
                    <div class="characterThumbnailContainer">
                        <img class="characterThumbnailImg" src="${characterImage}" alt="characterImage">
                    </div>
                    <dl class="characterBriefDetails">
                        <dt class="characterPrimaryName">${characterName}</dt>
                        ${character.name.full && character.name.native ? `<dd>${characterNativeName}</dd>` : ''}
                    </dl>
                </div>`;

                $charactersGrid.append(characterElement);
            });
        } else {
            $charactersGrid.html('<p>No character information available.</p>');
        }
    }
}
