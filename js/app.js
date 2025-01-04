import {initRouter, navigateTo} from './router.js';
import {setupNavbar} from "./partials/navbar.js";

document.addEventListener('DOMContentLoaded', async () => {
    await setupNavbar()
    initRouter();
});

document.addEventListener('click', (e) => {
    const target = e.target.closest('a');
    if (target?.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = target.getAttribute('href');
        navigateTo(path)
    }
});