import { router } from './router.js';

window.addEventListener('DOMContentLoaded', router);
window.addEventListener('popstate', router);

document.body.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
        e.preventDefault();
        history.pushState(null, '', e.target.href);
        router();
    }
});
