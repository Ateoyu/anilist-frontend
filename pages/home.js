export function renderHome() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <h1 class="text-2xl mb-4">AniList Character Lookup</h1>
    <form id="searchForm" class="mb-4">
      <input type="text" placeholder="Enter character ID..." class="p-2 text-black rounded" />
      <button class="ml-2 bg-blue-500 px-4 py-2 rounded">Search</button>
    </form>
  `;

    document.getElementById('searchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = e.target.querySelector('input').value;
        if (input) {
            history.pushState(null, '', `/character/${input}`);
            window.dispatchEvent(new Event('popstate'));
        }
    });
}
