let likedItemsList = [];
let filteredItems = [];
let currentCategory = 'all';
let totalResults = 0;
let page = 1;
const pageSize = 20;
const groupSize = 5;

const categoryMapping = {
    '문학' : ['소설/시/희곡'],
    '에세이' : ['에세이'],
    '자기계발' : ['자기계발'],
    '교양' : ['인문학', '사회과학', '역사'],
    '라이프스타일' : ['요리/살림', '여행'],
}

const findExactCategory = (categoryList, searchTerm) => {
    // 전체 카테고리
    if(searchTerm === 'all' || !searchTerm) return true;

    return categoryList.some(category => {
        const categories = category.categoryName.replace('국내도서>','').split('>');

        return categories.some(cat => {
            return categoryMapping[searchTerm].some(subCategory => subCategory === cat.trim());
        });
    });
}

const categoryButtons = document.querySelectorAll(".fav_category");
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {

        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        currentCategory = button.dataset.category;
        page = 1;
        console.log('current category :', currentCategory);
        getLikedItems();
    });
});

const getLikedItems = () => {
    const likedItems = localStorage.getItem("likedItems");
    likedItemsList = likedItems ? JSON.parse(likedItems) : []; 

    if(likedItemsList.length > 0) {
        // 카테고리 적용
        filteredItems = likedItemsList;

        if(currentCategory) {
            filteredItems = likedItemsList.filter(book => {
                return book.categoryIdList && findExactCategory(book.categoryIdList, currentCategory);
            })
        }

        totalResults = filteredItems.length;

        if(totalResults > 0) {
            renderLikedItems();
        } else {
            renderEmptyLikedItems()
        }
    } else {
        totalResults = 0;
        renderEmptyLikedItems();
    }
    renderPagination();
}

const renderLikedItems = () => {
    
    // 페이지네이션 적용을 위해 시작, 끝 인덱스 추가
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredItems.length);
    const currentPageItems = filteredItems.slice(startIndex, endIndex);

    let booksHTML = currentPageItems.map( book => `
        <div class="fav_book-card">
            <div class="fav_book-thum">
                <button type="button" class="fav_button-like" onclick="openLikeRemovePopup(${book.itemId})">
                    <i class="fa fa-solid fa-heart"></i>
                    <span class="fav_blind">찜 해제</span>
                </button>
                <img class="fav_book-image" src="${book.cover.replace('coversum','cover200')}" 
                    onclick="moveToDetail(${book.itemId})" alt="${book.title}">
            </div>
            <div class="fav_book-card-text">
                <h3 class="fav_book-title">${book.title}</h3>
                <p class="fav_book-author">${book.author}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('book-list').innerHTML = booksHTML;
}

const renderEmptyLikedItems = () => {
    let booksHTML = ``;

    if(currentCategory && currentCategory !== 'all') {
        booksHTML = `<div class="fav_no-items">'${currentCategory}' 카테고리에 해당하는 도서가 없습니다<br/>좋아하는 도서를 추가해 보세요</div>`
    } else {
        booksHTML = '<div class="fav_no-items">좋아하는 도서를 추가해 보세요</div>'
    }

    document.getElementById('book-list').innerHTML = booksHTML;
}

const renderPagination = () => {
    const totalPages = Math.ceil(totalResults / pageSize);
    const pageGroup = Math.ceil(page / groupSize);
    let lastPage = pageGroup * groupSize;
    let firstPage = Math.max(1, lastPage - (groupSize - 1));

    lastPage = Math.min(lastPage, totalPages);

    let paginationHTML = ``;

    //  처음 페이지 (`«`) 버튼 (첫 페이지에서는 숨김)
    if (page > 1) {
        paginationHTML = `<li class="page-item" onclick="moveToPage(1)">
                            <a class="page-link">«</a></li>
        <li class="page-item" onclick="moveToPage(${page - 1})">
                            <a class="page-link">‹</a></li>`;
    }

    for (let i = firstPage; i <= lastPage; i++) {
        paginationHTML += `<li class="page-item ${i === page ? 'active' : ''}" onclick="moveToPage(${i})"><a class="page-link">${i}</a></li>`;
    }

    //  다음 페이지 (`›`) 버튼 (마지막 페이지에서는 숨김)
    if (page < totalPages) {
        paginationHTML += `<li class="page-item" onclick="moveToPage(${page + 1})">
                            <a class="page-link">›</a></li><li class="page-item" onclick="moveToPage(${totalPages})">
                            <a class="page-link">»</a></li>`;
    }

    
    document.querySelector(".pagination").innerHTML = paginationHTML;
}


const removeLike = (itemId) => {

    const index = likedItemsList.findIndex( item => item.itemId === itemId);
    if(index > -1) {
        likedItemsList.splice(index, 1);
        localStorage.setItem('likedItems', JSON.stringify(likedItemsList));

        filteredItems = currentCategory ? likedItemsList.filter(book => {
            return book.categoryIdList && findExactCategory(book.categoryIdList, currentCategory);
        }) : likedItemsList;

        // 총 결과 수 업데이트
        totalResults = likedItemsList.length;
        // 현재 페이지 아이템이 0개가 되면 이전 페이지로 이동, 1페이지 제외
        const totalPages = Math.ceil(totalResults / pageSize);
        if(page > totalPages && page > 1) {
            page = totalPages;
        }

        if(totalResults > 0) {
            renderLikedItems();
        } else {
            renderEmptyLikedItems()
        }
        renderPagination();
    }
}

const openLikeRemovePopup = (itemId) => {
    document.querySelector('.fav_alert-msg').innerHTML = '즐겨찾기 목록에서 제외하시겠습니까?';
    document.querySelector('.fav_system-alert').style.display = 'block';

    document.querySelectorAll('.fav_pop-foot-button').forEach((button) => {
        const spanText = button.querySelector('span').textContent;
        button.addEventListener("click", () => closePopup(spanText, itemId));
    });
}

const closePopup = (type, itemId) => {
    if(type === '확인') {
        removeLike(itemId);
        document.querySelector('.fav_alert-msg').innerHTML = '';
        document.querySelector('.fav_system-alert').style.display = 'none';
    } else {
        document.querySelector('.fav_alert-msg').innerHTML = '';
        document.querySelector('.fav_system-alert').style.display = 'none';
    }
}

const moveToDetail = (itemId) => {
    location.href = `/pages/book-detail/detail?itemId=${itemId}`;
}

const moveToPage = (pageNum) => {
    console.log("moveToPage", pageNum);
    page = pageNum;
    renderLikedItems();
    renderPagination();
}

document.querySelector('.fav_category[data-category="all"]').classList.add('active');
getLikedItems();
