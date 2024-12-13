import {initRouter, navigateTo} from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    initRouter();
});

document.addEventListener('click', (e) => {
    const target = e.target.closest('a');
    if (target && target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = target.getAttribute('href');
        navigateTo(path)
    }
});