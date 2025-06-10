export function renderCharacter(id) {
    const $app = $('#app');
    $app.html(`<p>Loading character ${id}...</p>`);

    const query = `
    query ($id: Int) {
      Character(id: $id) {
        name {
          full
        }
        image {
          large
        }
        description(asHtml: true)
      }
    }
  `;

    const variables = {id: parseInt(id)};

    $.ajax({
        url: 'https://graphql.anilist.co',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({query, variables}),
        success: function (response) {
            const char = response.data.Character;

            //language=HTML
            $app.html(`
                <div class="characterContainer">
                    <div class="character">
                        <h1>${char.name.full}</h1>
                        <img src="${char.image.large}" alt="${char.name.full} image"/>
                    </div>
                    <div class="characterDescription">
                        ${char.description ?? '<p>No description.</p>'}
                    </div>
                </div>
            `);
        },
        error: function () {
            $app.html(`<p class="error-message">Failed to load character.</p>`);
        }
    });
}
