export function sanitize(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}


export function getJsonHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    return headers;
}
