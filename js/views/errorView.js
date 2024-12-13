export function renderView() {
    const content = document.getElementById('content');
    content.textContent = '';
    const h2 = document.createElement('h2');
    h2.textContent = 'An error occurred';
    content.appendChild(h2);

    const p = document.createElement('p');
    p.textContent = 'Sorry, something went wrong. Please try again later.';
    content.appendChild(p);
}
export function renderView() {
    const content = document.getElementById('content');
    content.textContent = '';
    const h2 = document.createElement('h2');
    h2.textContent = '403 - Access Denied';
    content.appendChild(h2);
}
export function renderView() {
    const content = document.getElementById('content');
    content.textContent = '';
    const h2 = document.createElement('h2');
    h2.textContent = '500 - Internal Server Error';
    content.appendChild(h2);
}
