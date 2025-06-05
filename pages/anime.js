import { getAnimeByIdQuery } from "../queries/getAnimeByIdQuery.js";

export function renderAnimeDetails(id) {
    const $app = $('#app');
  // language=HTML
    $app.html(`
        <div id="bannerAndTitleWrapper">
            <div id="banner"></div>
            <div class="coverImageWrapper">
                <img class="coverImage" alt="coverImage">
            </div>
            <div class="content">
                <h1 class="englishTitle"></h1> 
            </div>
        </div>
        
        <div id="animeDescriptionWrapper">
            <p id="animeDescription"></p>
            <div class="expandContractButton">Read More</div>
        </div>

        <div class="mediaDataContainer">
            <dl class="mediaData">
                <div class="data avgScore">
                    <dt>Average Score: </dt>
                </div>
                <div class="data episodes">
                    <dt>Episodes: </dt>
                </div>
                <div class="data startDate">
                    <dt>Start Date: </dt>
                </div>
                <div class="data endDate">
                    <dt>End Date: </dt>
                </div>
            </dl>
            <div class="mediaOverview">
                <h2>Characters</h2>
                <div id="charactersGrid">
                    <!-- Characters will be added here dynamically -->
                </div>
            </div>
        </div>
        `);

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

    function appendCharacterCards(media) {
        // Add characters to the grid
        const $charactersGrid = $('#charactersGrid');
        media.characters.edges.forEach(edge => {
            const character = edge.node;
            const characterRole = edge.role;
            const characterId = character.id;
            const characterName = character.name.full || character.name.native;
            const characterNativeName = character.name.native;
            const characterImage = character.image.large;

            const characterElement = `
                <div class="characterDiv" data-link href="/character/${characterId}">
                    <div class="characterThumbnailContainer">
                        <img class="characterThumbnailImg" src="${characterImage}" alt="${characterName}">
                    </div>
                    <dl class="characterBriefDetails">
                        <dt class="characterPrimaryName">${characterName}</dt>
                        ${character.name.full && character.name.native ? `<dd>${characterNativeName}</dd>` : ''}
                        <dd>${characterRole}</dd>   
                    </dl>
                </div>`;

            $charactersGrid.append(characterElement);
        });
    }

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

        let startDate = `${media.startDate.day}/${media.startDate.month}/${media.startDate.year}`;
        let endDate = `${media.endDate.day}/${media.endDate.month}/${media.endDate.year}`;

        $('#banner').css('background-image', `url(${bannerImage})`)
        $('.coverImageWrapper .coverImage').attr('src', `${coverImage}`)
        displayAnimeTitles(title, romajiTitle, nativeTitle);
        $('#animeDescription').html(description);
        $('.data.avgScore').append(`<dd>${averageScore}</dd>`)
        $('.data.episodes').append(`<dd>${episodes}</dd>`)
        $('.data.startDate').append(`<dd>${startDate}</dd>`)
        $('.data.endDate').append(`<dd>${endDate}</dd>`)
        appendCharacterCards(media);
    }

    function displayAnimeTitles(englishTitle, romajiTitle, nativeTitle) {
        const $animeNameAndDesc = $('.content');
        $animeNameAndDesc.find('h1').text(englishTitle ? englishTitle : romajiTitle ? romajiTitle : nativeTitle);
    }
}
