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
        description
      }
    }
  `;

    const variables = { id: parseInt(id) };

    $.ajax({
        url: 'https://graphql.anilist.co',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ query, variables }),
        success: function(response) {
            const char = response.data.Character;

            $app.html(`
              <h1 class="text-2xl mb-4">${char.name.full}</h1>
              <img src="${char.image.large}" class="w-48 mb-4 rounded"  alt="${char.name.full} image"/>
              <p class="text-gray-300">${char.description ?? 'No description.'}</p>
            `);
        },
        error: function() {
            $app.html(`<p class="text-red-500">Failed to load character.</p>`);
        }
    });
}
