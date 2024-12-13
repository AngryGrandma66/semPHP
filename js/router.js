// router.js
const routes = {
    '/': 'home',
    '/home': 'home',
    '/login': 'login',
    '/register': 'register',
    '/chatroom/one': 'chatroom'
};

export function initRouter() {
    window.addEventListener('popstate', handleRoute);
    handleRoute();
}

export function navigateTo(path) {
    history.pushState({}, '', path);
    handleRoute();
}

async function handleRoute() {
    const path = window.location.pathname;
    const view = routes[path];
    const content = document.getElementById('content');
    content.textContent = 'Loading...';

    if (!view) {
        // Not Found
        import('./views/notFoundView.js').then(module => module.renderView());
        return;
    }

    // Dynamically import the correct view
    import(`./views/${view}View.js`).then(module => module.renderView());
}
