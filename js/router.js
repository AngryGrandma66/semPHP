
const routes = {
    '/': 'home',
    '/home': 'home',
    '/login': 'login',
    '/register': 'register',
    '/chatroom/{name}': 'chatroom',
    '/profile/{username}': 'profile',
    '/users': 'users',
};

const BASE_PATH = '/~krupima3';

function matchRoute(path, routes) {
    for (const routePattern in routes) {
        const paramNames = [];
        let regexPattern = routePattern.replace(/\//g, '\\/');

        regexPattern = regexPattern.replace(/{([^}]+)}/g, (match, paramName) => {
            paramNames.push(paramName);
            return '([^\\/]+)';
        });

        const regex = new RegExp(`^${regexPattern}$`);
        const match = path.match(regex);
        if (match) {
            const params = {};
            paramNames.forEach((name, index) => {
                params[name] = decodeURIComponent(match[index + 1]);
            });
            return { view: routes[routePattern], params };
        }
    }
    return null;
}

export function initRouter() {
    window.addEventListener('popstate', handleRoute);
    handleRoute();
}

export function navigateTo(path) {
    history.pushState({}, '', BASE_PATH + path);
    handleRoute();
}

async function handleRoute() {
    let path = window.location.pathname;

    if (BASE_PATH && path.startsWith(BASE_PATH)) {
        path = path.slice(BASE_PATH.length);
    }

    if (path.startsWith('/docs/')) {
        window.location.href = BASE_PATH + path;
        return;
    }

    const match = matchRoute(path, routes);
    if (!match) {
        import('./views/notFoundView.js').then(module => module.renderView());
        return;
    }

    const { view, params } = match;
    try {
        const module = await import(`./views/${view}View.js`);
        if (typeof module.renderView === 'function') {
            if (params) {
                module.renderView(params);
            } else {
                module.renderView();
            }
        } else {
            console.error(`renderView is not a function in ${view}View.js`);
            import('./views/errorView.js').then(mod => mod.renderView());
        }
    } catch (error) {
        console.error(`Error loading view ${view}View.js:`, error);
        import('./views/errorView.js').then(mod => mod.renderView());
    }
}
