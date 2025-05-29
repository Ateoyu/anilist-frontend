export function renderHome() {
    const $app = $('#app');
    $app.html(`
    <h1 class="text-2xl mb-4">AniList Character Lookup</h1>
    <form id="searchForm" class="mb-4">
      <input type="text" placeholder="Enter character ID..." class="p-2 text-black rounded" />
      <button class="ml-2 bg-blue-500 px-4 py-2 rounded">Search</button>
    </form>
  `);

    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const input = $(this).find('input').val();
        if (input) {
            history.pushState(null, '', `/character/${input}`);
            $(window).trigger('popstate');
        }
    });
}
