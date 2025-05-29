import './styles/main.scss'
import { router } from './router.js';
import $ from 'jquery';

// Make jQuery available globally
window.$ = window.jQuery = $;

$(document).ready(router);
$(window).on('popstate', router);

$(document).on('click', '[data-link]', function(e) {
    e.preventDefault();
    history.pushState(null, '', $(this).attr('href'));
    router();
});
