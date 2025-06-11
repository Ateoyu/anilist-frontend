import './styles/main.scss'
import {navigateWithViewTransition, router} from './router.js';
import $ from 'jquery';

// Make jQuery available globally
window.$ = window.jQuery = $;

$(document).ready(router);

$(window).on('popstate', function () {
    if (!document.startViewTransition) {
        router();
        return;
    }

    document.startViewTransition(() => {
        router();
    });
});

$(document).on('click', '[data-link]', function (e) {
    e.preventDefault();
    const href = $(this).attr('href');
    navigateWithViewTransition(href);
});