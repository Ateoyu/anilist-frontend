import {renderHome} from './pages/home.js';
import {renderCharacter} from './pages/character.js';
import {renderBrowse} from "./pages/browse.js";
import {renderAnimeDetails} from "./pages/anime.js";

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
        const id = path.split('/')[2];
        renderAnimeDetails(id);
    } else {
        $('#app').html(`<p>404 Page Not Found</p>`);
    }
}

export function navigateWithViewTransition(url) {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
        // Fallback for browsers that don't support View Transitions
        history.pushState(null, '', url);
        router();
        return;
    }

    document.startViewTransition(() => {
        history.pushState(null, '', url);
        router();
    });
}