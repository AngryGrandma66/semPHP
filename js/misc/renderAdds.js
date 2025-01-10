export function renderChatrooms(chatroomList, chatrooms) {
    // Clear existing chatrooms
    chatroomList.innerHTML = '';

    if (chatrooms.length === 0) {
        chatroomList.innerHTML = '<p>No chatrooms found.</p>';
        return;
    }

    const ul = document.createElement('ul'); // Create a list to hold chatrooms

    for (const chatroom of chatrooms) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '/chatroom/' + encodeURIComponent(chatroom.name);
        link.textContent = chatroom.name;
        li.appendChild(link);
        ul.appendChild(li);
    }

    chatroomList.appendChild(ul);
}
/**
 * Fancy pagination that always displays:
 *   [Prev] [1] [p-1] [p] [p+1] [total] [Next]
 * with edge-case handling for small total or for p near the ends.
 */
export function renderFancyPagination(
    containerEl,      // e.g. paginationBar
    currentPage,
    totalPages,
    onPageClick       // callback: (pageNumber) => { ... }
) {
    containerEl.innerHTML = '';

    // "Prev"
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Prev';
        prevBtn.addEventListener('click', () => onPageClick(currentPage - 1));
        containerEl.appendChild(prevBtn);
    }

    // Helper to add a single page button
    function addPageButton(pageNum, disabledIfSame) {
        // If we already appended that page, skip it
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

    // Always show first page if totalPages > 1
    if (totalPages > 1) {
        addPageButton(1, /*disabledIfSame=*/true);
    }

    // Show [p-1] if >= 2 (and not 1)
    if (currentPage > 2) {
        addPageButton(currentPage - 1, /*disabledIfSame=*/false);
    }

    // If current page not 1 or total, show it in the middle
    if (currentPage !== 1 && currentPage !== totalPages) {
        addPageButton(currentPage, /*disabledIfSame=*/true);
    }

    // Show [p+1] if <= totalPages-1
    if (currentPage < totalPages - 1) {
        addPageButton(currentPage + 1, /*disabledIfSame=*/false);
    }

    // Always show last page if totalPages > 1
    if (totalPages > 1) {
        addPageButton(totalPages, /*disabledIfSame=*/true);
    }

    // "Next"
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next';
        nextBtn.addEventListener('click', () => onPageClick(currentPage + 1));
        containerEl.appendChild(nextBtn);
    }
}

