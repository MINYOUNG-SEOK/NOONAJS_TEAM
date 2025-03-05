const PROXY_URL = "https://api.allorigins.win/get?url=";
const API_KEY = "ttblsy0006261819001"; 


// 카테고리 ID 매핑
const categories = {
    "문학": 1,
    "에세이": 55889,
    "자기계발": 336,
    "인문학": 656,
    "사회과학": 798,
    "역사": 74,
    "가정/요리/뷰티": 1230,
    "여행": 1196
};

// API 호출 함수 (프록시 적용)
getBooks = async(categoryId)=> {
    const originalUrl = `https://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=${API_KEY}&QueryType=ItemNewAll&MaxResults=20&start=1&SearchTarget=Book&CategoryId=${categoryId}&output=js&Cover=Big&Version=20131101`;

    // 프록시 적용하여 임시CORS 문제 해결
    const proxyUrl = `${PROXY_URL}${encodeURIComponent(originalUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const rawData = await response.json();

        // JSON 파싱 필요 (AllOrigins의 경우)
        const data = JSON.parse(rawData.contents);

        if (data.item) {
            renderBooks(data.item);
        } else {
            console.error("데이터가 없습니다.");
        }
    } catch (error) {
        console.error("API 호출 오류:", error);
    }
}

// 화면에 도서 목록 표시
function renderBooks(books) {
    const bookContainer = document.getElementById("book-list");
    bookContainer.innerHTML = ""; // 기존 목록 삭제



    books.forEach(book => {
        // 이미지가 없으면 표시하지 않음
        if (!book.cover || book.cover.includes("https://image.aladin.co.kr/img/noimg_b.gif")) {
            return; 
        }
        const bookItem = document.createElement("div");
        bookItem.classList.add("book");
        // console.log("북북",bookItem)

        bookItem.innerHTML = `
            <img src="${book.cover}" alt="${book.title}">
            <h3 class="categories-title">${book.title}</h3>
            <p class="categories-author">${book.author}</p>
        `;

        bookContainer.appendChild(bookItem);
    });
}

// 카테고리 클릭 이벤트 추가
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".category").forEach(button => {
        button.addEventListener("click", () => {
            const categoryName = button.dataset.category;
            getBooks(categories[categoryName]); // 해당 카테고리의 도서 가져오기
        });
    });
});
