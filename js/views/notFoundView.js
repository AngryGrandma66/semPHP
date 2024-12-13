export function renderView() {
    const content = document.getElementById('content');
    content.textContent = '';
    const h2 = document.createElement('h2');
    h2.textContent = '404 - Page Notdssadad Found';
    content.appendChild(h2);
}
