const API_PROXY_URL = `${window.location.origin}/.netlify/functions/api-proxy`;
let bookList = [];
let currentCategoryId = null; //  선택된 카테고리 ID 저장

document.addEventListener("DOMContentLoaded", () => {
    const menus = document.querySelectorAll(".category-nav button");
    menus.forEach(menu => menu.addEventListener("click", (event) => getBooksCategory(event)));
});

let totalResults = 0;
let page = 1;
const pageSize = 20;
const groupSize = 5;
const maxResultsLimit = 200;

// getBooks() → 선택된 카테고리를 유지하도록 변경
const getBooks = async () => {
    const maxPages = Math.ceil(maxResultsLimit / pageSize); // 최대 페이지 계산
    if (page > maxPages) page = maxPages; // 200개 이상 요청 방지

    const url = `${API_PROXY_URL}?apiType=ItemList&QueryType=ItemNewAll&MaxResults=${pageSize}&start=${page}&SearchTarget=Book&output=JS&Version=20131101&Cover=Big`
        + (currentCategoryId ? `&CategoryId=${currentCategoryId}` : ""); 
        
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("rrr",response)
        const data = await response.json();
        bookList = data.item;
        // totalResults = data.totalResults;
        totalResults = Math.min(data.totalResults, maxResultsLimit); // 200개까지만 반영


        render();
        paginationRender();
        console.log("dddd", bookList);
    } catch (error) {
        console.error("API 호출 오류:", error);
    }
};

// 카테고리 선택 시 currentCategoryId 설정 후 도서 불러오기
const getBooksCategory = async (event) => {
    const category = event.target.textContent.trim();
    console.log("category?", category);

    const categoryMapping = {
        "문학": 1,
        "에세이": 55889,
        "자기계발": 336,
        "인문학": 656,
        "사회과학": 798,
        "역사": 74,
        "가정/요리/뷰티": 1230,
        "여행": 1196
    };

    currentCategoryId = categoryMapping[category] || null;
    page = 1; // 첫 페이지부터 시작
    getBooks();
};

const render = () => {
    let booksHTML = bookList
    // .filter(book => book.cover !== "https://image.aladin.co.kr/img/noimg_b.gif") //이미지 없으면 표시안하기
    .map(book => `
        <div class="book-card">
            <img src="${book.cover}" alt="${book.title}">
            <h3 class="categories-title">${book.title}</h3>
            <p class="categories-author">${book.author}</p>
        </div>
    `).join('');

    document.getElementById('book-list').innerHTML = booksHTML;
};

const paginationRender = () => {
    // const totalPages = Math.ceil(totalResults / pageSize);
    const totalPages = Math.ceil(Math.min(totalResults, maxResultsLimit) / pageSize); // 최대 200개 제한 적용
    const pageGroup = Math.ceil(page / groupSize);
    let lastPage = pageGroup * groupSize;
    //firstPage가 항상 1 이상이 되도록
    let firstPage = Math.max(1, lastPage - (groupSize - 1));

    lastPage = Math.min(lastPage, totalPages);

    let paginationHTML = ``;

    //  처음 페이지 (`«`) 버튼 (첫 페이지에서는 숨김)
    if (page > 1) {
        paginationHTML = `<li class="category-page-item" onclick="moveToPage(1)"><a class="category-page-link"href="#top">«</a></li>
        <li class="category-page-item" onclick="moveToPage(${page - 1})"><a class="category-page-link"href="#top">‹</a></li>`;
    }

    for (let i = firstPage; i <= lastPage; i++) {
        paginationHTML += `<li class="category-page-item ${i === page ? 'active' : ''}" onclick="moveToPage(${i})"><a class="category-page-link"href="#top">${i}</a></li>`;
    }

    //  다음 페이지 (`›`) 버튼 (마지막 페이지에서는 숨김)
    if (page < totalPages) {
        paginationHTML += `<li class="category-page-item" onclick="moveToPage(${page + 1})"><a class="category-page-link"href="#top">›</a></li><li class="category-page-item" onclick="moveToPage(${totalPages})"><a class="category-page-link" href="#top">»</a></li>`;
    }

    
    document.querySelector(".category-pagination").innerHTML = paginationHTML;
};

// 페이지 이동 시 선택된 카테고리 유지
const moveToPage = (pageNum) => {
    console.log("moveToPage", pageNum);
    page = pageNum;
    getBooks(); 
};

// getBooks(); 
