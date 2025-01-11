// /js/router.js

// 1. Define routes as you do now
const routes = {
    '/': 'home',
    '/home': 'home',
    '/login': 'login',
    '/register': 'register',
    '/chatroom/{name}': 'chatroom',
    '/profile/{username}': 'profile',
    '/users': 'users',
};

// 2. Set your BASE_PATH to /~krupima3 for production, or '' (empty) for dev
const BASE_PATH = '/~krupima3';

// 3. The matchRoute logic remains unchanged
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

// 4. Export the initRouter + navigateTo as usual
export function initRouter() {
    window.addEventListener('popstate', handleRoute);
    handleRoute();
}

export function navigateTo(path) {
    // e.g. navigateTo('/home') => pushState to /~krupima3/home
    history.pushState({}, '', BASE_PATH + path);
    handleRoute();
}

async function handleRoute() {
    // 5. Grab the real location.pathname
    let path = window.location.pathname;

    // If it starts with /~krupima3, remove that prefix
    if (BASE_PATH && path.startsWith(BASE_PATH)) {
        path = path.slice(BASE_PATH.length);
        // Now for /~krupima3/home => path = /home
    }

    // Now do your route matching
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
