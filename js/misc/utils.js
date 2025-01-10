export function sanitize(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}


export function getJsonHeaders() {
    return {'Content-Type': 'application/json'};
}
