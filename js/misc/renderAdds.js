export function renderChatrooms(chatroomList, chatrooms) {

    const newContent = document.createElement('div');

    if (chatrooms.length === 0) {
        newContent.innerHTML = '<p>No chatrooms found.</p>';
    } else {
        const ul = document.createElement('ul');
        for (const chatroom of chatrooms) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '/chatroom/' + encodeURIComponent(chatroom.name);
            link.textContent = chatroom.name;
            li.appendChild(link);
            ul.appendChild(li);
        }
        newContent.appendChild(ul);
    }

    chatroomList.replaceChildren(...newContent.childNodes);
}

export function renderFancyPagination(containerEl, currentPage, totalPages, onPageClick) {
    containerEl.innerHTML = '';
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Prev';
        prevBtn.addEventListener('click', () => onPageClick(currentPage - 1));
        containerEl.appendChild(prevBtn);
    }

    function addPageButton(pageNum, disabledIfSame) {
        if (containerEl.querySelector(`[data-page='${pageNum}']`)) return;

        const pageBtn = document.createElement('button');
        pageBtn.dataset.page = pageNum;
        pageBtn.textContent = pageNum.toString();

        if (disabledIfSame && pageNum === currentPage) {
            pageBtn.disabled = true;
        }
        pageBtn.addEventListener('click', () => onPageClick(pageNum));
        containerEl.appendChild(pageBtn);
    }

    if (totalPages > 1) {
        addPageButton(1, true);
    }

    if (currentPage > 2) {
        addPageButton(currentPage - 1, false);
    }

    if (currentPage !== 1 && currentPage !== totalPages) {
        addPageButton(currentPage, true);
    }

    if (currentPage < totalPages - 1) {
        addPageButton(currentPage + 1, false);
    }

    if (totalPages > 1) {
        addPageButton(totalPages, true);
    }
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => onPageClick(currentPage + 1));
        containerEl.appendChild(nextBtn);
    }
}

