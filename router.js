import { renderHome } from './pages/home.js';
import { renderCharacter } from './pages/character.js';
import {renderBrowse} from "./pages/browse.js";

export function router() {
    const path = window.location.pathname;

    if (path === '/') {
        renderHome();
    } else if (path.startsWith('/character/')) {
        const id = path.split('/')[2];
        renderCharacter(id);
    } else if (path.startsWith('/browse')) {
        renderBrowse();
    } else if (path.startsWith('/anime/')) {
        console.log("anime details view works.");
    }
    else {
        $('#app').html(`<p>404 Page Not Found</p>`);
    }
}
