const urlParams = new URLSearchParams(window.location.search);
const itemId = urlParams.get("itemId") || '';
const likeButton = document.querySelector('.detail_button-like');
const linkButton = document.querySelector('.detail_button-link');
let bookData = {};

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

        const response = await fetch(url);
        const data = await response.json();

        bookData = data.item[0];

        if(bookData) {
            renderBookTitleAndCover();
            renderBookSummary();
            renderBasicInfos();
            renderRating();
        } else {
            openPopup('도서 정보가 존재하지 않습니다.<br/>확인을 누르면 이전 페이지로 이동합니다.', 'error');
        }
        
    } catch(error) {
        console.log('데이터 가져오기 실패: ', error);
        openPopup('문제가 발생했습니다.<br/>확인을 누르면 이전 페이지로 이동합니다.', 'error');
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

    // 찜하기 여부
    if(isLiked()) {
        const btnImg = document.querySelector('.detail_button-like>i');
        btnImg.classList.remove('fa-heart-o');
        btnImg.classList.add('fa-heart');
        likeButton.classList.add('active');
        document.querySelector('.detail_button-like>span').textContent = "찜 해제";
    }
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
    document.getElementById('detail_price').textContent = bookData.priceStandard.toLocaleString('ko-KR');
    // 구매링크
    document.querySelector('.detail_buy-link a').href= bookData.link;

    // 도서소개
    document.getElementById('detail_description').textContent = bookData.description;
}

const openPopup = (message, type) => {
    document.querySelector('.detail_alert-msg').innerHTML = message;
    document.querySelector('.detail_system-alert').style.display = 'block';

    document.querySelector('.detail_pop-foot-button').addEventListener('click', () => closePopup(type));
}

const closePopup = (type) => {
    if(type === 'alert') {
        document.querySelector('.detail_alert-msg').innerHTML = '';
        document.querySelector('.detail_system-alert').style.display = 'none';
    } else {
        history.back();
    }
}

// 점수 별 5개로 출력하기
const renderRating = () => {
    const ratingInfo = bookData.subInfo.ratingInfo;

    let starsHTML = ``;
    if(ratingInfo) {
        const score = ratingInfo.ratingScore;
        // 별 하나당 2점
        
        // 꽉 찬 별 개수
        const fullStars = Math.floor(score / 2);
        // 반 별 여부 계산
        const hasHalfStar = fullStars * 2 < score;
        // 빈 별 개수
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        // 꽉 찬 별 추가
        for(let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fa fa-solid fa-star"></i>';
        }
        // 반 별 추가
        if(hasHalfStar) {
            starsHTML += '<i class="fa fa-solid fa-star-half-o"></i>';
        }
        // 빈 별 추가
        for(let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="fa fa-solid fa-star-o"></i>';
        }

        document.getElementById('detail_rating-stars').innerHTML = starsHTML;
        document.querySelector('.detail_rating-text').textContent = ratingInfo.ratingScore;
        document.getElementById('detail_rating-count').textContent = `(${ratingInfo.ratingCount}건)`;
    }
}

/**
 * 찜하기 관련
 */
const getLikedItems = () => {
    const likedItems = localStorage.getItem("likedItems");
    return likedItems ? JSON.parse(likedItems) : []; 
}

const isLiked = () => {
    return getLikedItems().some((item) => item.itemId === bookData.itemId);
}

const toggleLike = () => {
    const likedItems = getLikedItems();
    const index = likedItems.findIndex( item => item.itemId === bookData.itemId );

    const btnImg = document.querySelector('.detail_button-like>i');
    const btnSpan = document.querySelector('.detail_button-like>span');
    if(index === -1) {
        likedItems.push(bookData);
        likeButton.classList.add('active');

        btnImg.classList.remove('fa-heart-o');
        btnImg.classList.add('fa-heart');
        btnSpan.textContent = '찜 해제';
    } else {
        likedItems.splice(index, 1);
        likeButton.classList.remove('active');

        btnImg.classList.remove('fa-heart');
        btnImg.classList.add('fa-heart-o');
        btnSpan.textContent = '찜하기';
    }

    localStorage.setItem('likedItems', JSON.stringify(likedItems));
}

const copyLink = async() => {
    try {
        // 현재 페이지 URL 가져오기
        const currentUrl = window.location.href;
        
        // 클립보드에 복사
        await navigator.clipboard.writeText(currentUrl);
        
        // 성공 메시지 표시
        openPopup('URL을 복사하였습니다', 'alert');
    } catch (error) {
        console.error('링크 복사 실패:', error);
        // 실패 메시지 표시
        openPopup('URL을 복사하지 못했습니다', 'alert');
    }
}

getBookDetail();
likeButton.addEventListener("click", toggleLike);
linkButton.addEventListener("click", copyLink);
