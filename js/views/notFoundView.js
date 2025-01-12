export function renderView() {

    const title = document.querySelector('title');
    title.innerText = 'notFound';
    const content = document.getElementById('content');
    content.textContent = '';
    const h2 = document.createElement('h2');
    h2.textContent = '404 - Page Not Found';
    content.appendChild(h2);
}
