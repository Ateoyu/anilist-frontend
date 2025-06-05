export function renderHome() {
    const $app = $('#app');
    $app.html(`
    <h1>AniList Character Lookup</h1>
    <form id="searchForm">
      <input type="text" placeholder="Enter character ID..." />
      <button>Search</button>
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
