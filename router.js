import { renderHome } from './pages/home.js';
import { renderCharacter } from './pages/character.js';

export function router() {
    const path = window.location.pathname;

    if (path === '/') {
        renderHome();
    } else if (path.startsWith('/character/')) {
        const id = path.split('/')[2];
        renderCharacter(id);
    } else {
        document.getElementById('app').innerHTML = `<p>404 Page Not Found</p>`;
    }
}
