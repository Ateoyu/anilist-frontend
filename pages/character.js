export async function renderCharacter(id) {
    const app = document.getElementById('app');
    app.innerHTML = `<p>Loading character ${id}...</p>`;

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

    try {
        const res = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });
        const { data } = await res.json();

        const char = data.Character;

        app.innerHTML = `
      <h1 class="text-2xl mb-4">${char.name.full}</h1>
      <img src="${char.image.large}" class="w-48 mb-4 rounded" />
      <p class="text-gray-300">${char.description || 'No description.'}</p>
    `;
    } catch (err) {
        app.innerHTML = `<p class="text-red-500">Failed to load character.</p>`;
    }
}
