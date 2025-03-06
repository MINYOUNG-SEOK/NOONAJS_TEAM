const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get("itemId") || '356320035';
let bookData = {
    "title": "이별할 땐 문어",
    "link": "http://www.aladin.co.kr/shop/wproduct.aspx?ItemId=359106312&amp;partner=openAPI&amp;start=api",
    "author": "정진아 (지은이), 김지현 (옮긴이)",
    "pubDate": "2025-03-05",
    "description": "국내에 처음 소개되는 한국계 미국인 작가 정진아의 『이별할 땐 문어』는 서른을 맞은 주인공 ‘로’의 사랑과 이별, 상처와 성장, 동물 친구와의 교감을 다룬다. 더불어 서른이라는 나이에 새로운 관점을 제안한다.",
    "isbn": "K302037592",
    "isbn13": "9791170612162",
    "itemId": 359106312,
    "priceSales": 16200,
    "priceStandard": 18000,
    "mallType": "BOOK",
    "stockStatus": "",
    "mileage": 900,
    "cover": "https://image.aladin.co.kr/product/35910/63/coversum/k302037592_1.jpg",
    "categoryId": 50919,
    "categoryName": "국내도서>소설/시/희곡>영미소설",
    "publisher": "복복서가",
    "salesPoint": 650,
    "adult": false,
    "fixedPrice": true,
    "customerReviewRank": 0,
    "subInfo": {
        "subTitle": "세상의 모든 전략과 전술",
        "originalTitle": "Sea Change",
        "itemPage": 408,
        "ratingInfo": {
            "ratingScore": 0,
            "ratingCount": 0,
            "commentReviewCount": 0,
            "myReviewCount": 0
        }
    }
};

// 책 정보 가져오기
async function getBookDetail() {
    try {
        const searchParams = new URLSearchParams();
        // ?apiType=ItemLookUp&itemIdType=ItemId&ItemId=${itemId}&OptResult=ratingInfo,authors,reviewList
        searchParams.set('apiType', 'ItemLookUp');
        searchParams.set('itemIdType', 'ItemId');
        searchParams.set('ItemId', itemId);
        searchParams.set('OptResult', 'ratingInfo');

        const url = `/.netlify/functions/api-proxy?${searchParams.toString()}`;
        console.log('book detail url : ', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('도서 상세정보 data', data);
        bookData = data.item[0];

        if(bookData) {
            renderBookTitleAndCover();
            renderBookSummary();
            renderBasicInfos();
        } else {
            //renderError();
        }
        
    } catch(error) {
        console.log('데이터 가져오기 실패: ', error);
    }
}

// 제목 정보 및 이미지 출력
const renderBookTitleAndCover = () => {
    // 제목
    document.querySelector('.detail_book-title').textContent = bookData.title;

    // 부제목
    if(bookData.subInfo.subTitle) {
        document.querySelector('.detail_sub-title').textContent = bookData.subInfo.subTitle;
    }

    // 이미지
    document.getElementById('detail_bookCover').src = bookData.cover.replace('coversum', 'cover500');
    document.getElementById('detail_bookCover').alt = bookData.title;
    document.querySelector('.detail_m_bg').style.backgroundImage = `url("${bookData.cover.replace('coversum', 'cover500')}")`;
}

// 요약 정보
const renderBookSummary = () => {
    console.log('render Book Detail : ', bookData);
    
    let summaryHTML = ``;
    // 원서명
    if(bookData.subInfo.originalTitle) {
        summaryHTML += `<li>
                            <strong class="detail_bi-title">원서명</strong>
                            <span>${bookData.subInfo.originalTitle}</span>
                        </li>`;
    }
    // 작가 - 지은이
    summaryHTML += `<li>
                        <strong class="detail_bi-title">저자</strong>
                        <span>${bookData.author}</span>
                    </li>`;
    // 출판사
    summaryHTML += `<li>
                        <strong class="detail_bi-title">출판사</strong>
                        <span>${bookData.publisher}</span>
                    </li>`;
    // 발행일
    summaryHTML += `<li>
                        <strong class="detail_bi-title">발행일</strong>
                        <span>${bookData.pubDate}</span>
                    </li>`;

    document.querySelector('.detail_summary').innerHTML = summaryHTML;
};

// 그 외 기본 정보 출력
const renderBasicInfos = () => {
    // isbn
    let isbn = (bookData.isbn13) ? bookData.isbn13 : bookData.isbn;
    if(bookData.isbn13) {
        // 979-11-911-1477-5
        isbn = `${isbn.substring(0,3)}-${isbn.substring(3,5)}-${isbn.substring(5,8)}`
             + `-${isbn.substring(8,12)}-${isbn.substring(12)}`;
    } else {
        // 0-545-01022-5
        isbn = `${isbn.substring(0,1)}-${isbn.substring(1,4)}-${isbn.substring(4,9)}-${isbn.substring(9)}`;
    }
    document.getElementById('detail_isbn').textContent = isbn;

    // category
    document.getElementById('detail_category').textContent = bookData.categoryName;
    // 정가
    document.getElementById('detail_price').textContent = bookData.priceStandard;
    // 구매링크
    document.querySelector('.detail_buy-link a').href= bookData.link;

    // 도서소개
    document.getElementById('detail_description').textContent = bookData.description;
}


getBookDetail();
