let likedItemsList = [];
let totalResults = 0;
let page = 1;
const pageSize = 20;
const groupSize = 5;


const getLikedItems = () => {
    const likedItems = localStorage.getItem("likedItems");
    likedItemsList = likedItems ? JSON.parse(likedItems) : []; 

    if(likedItemsList.length > 0) {
        console.log('likedItem', likedItemsList);

        totalResults = likedItemsList.length;
        renderLikedItems();
        renderPagination();
    } else {

    }
}

const renderLikedItems = () => {
    let booksHTML = likedItemsList.map( book => `
        <div class="fav_book-card">
            <div class="fav_book-thum">
                <button type="button" class="fav_button-like" onclick="removeLike(${book.itemId})">
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

const renderPagination = () => {
    const totalPages = Math.ceil(totalResults / pageSize);
    const pageGroup = Math.ceil(page / groupSize);
    let lastPage = pageGroup * groupSize;
    let firstPage = Math.max(1, lastPage - (groupSize - 1));

    lastPage = Math.min(lastPage, totalPages);

    let paginationHTML = ``;

    
}

const removeLike = (itemId) => {

    openPopup('즐겨찾기 목록에서 제외하시겠습니까?');
    // const index = likedItemsList.findIndex( item => item.itemId === itemId);
    // if(index > -1) {
    //     likedItemsList.splice(index, 1);
    //     localStorage.setItem('likedItems', JSON.stringify(likedItemsList));

    //     renderLikedItems();
    // }
    
}

const moveToDetail = (itemId) => {
    location.href = `/pages/book-detail/detail?itemId=${itemId}`;
}

const openPopup = (message) => {
    document.querySelector('.fav_alert-msg').innerHTML = message;
    document.querySelector('.fav_system-alert').style.display = 'block';

    document.querySelectorAll('.fav_pop-foot-button').forEach((button) => {
        const spanText = button.querySelector('span').textContent;
        button.addEventListener("click", () => closePopup(spanText));
    });
}

const closePopup = (type) => {
    if(type === '확인') {
        document.querySelector('.fav_alert-msg').innerHTML = '';
        document.querySelector('.fav_system-alert').style.display = 'none';
    } else {
        document.querySelector('.fav_alert-msg').innerHTML = '';
        document.querySelector('.fav_system-alert').style.display = 'none';
    }
}




getLikedItems();
