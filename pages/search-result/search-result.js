async function getSearchResults() {
  // URL에서 query와 page 값 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");

  let currentPage = parseInt(urlParams.get("page")) || 1;
  console.log("현재 페이지:", currentPage);

  if (!query) {
    document.querySelector("search-results").innerHTML =
      "<p>검색어가 없습니다.</p>";
    return;
  }

  try {
    // API 요청
    const searchParams = new URLSearchParams();
    searchParams.set("apiType", "ItemSearch");
    searchParams.set("Query", query);
    searchParams.set("QueryType", "Title");
    searchParams.set("MaxResults", "20");
    searchParams.set("start", currentPage); //start 값 수정
    searchParams.set("SearchTarget", "Book");

    const url = `/.netlify/functions/api-proxy?${searchParams.toString()}`;
    console.log("검색 API 요청 URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log("API 응답 데이터:", data);
    console.log("응답된 아이템 개수:", data.item ? data.item.length : 0);

    if (!data.item || data.item.length === 0) {
      document.getElementById("search-results").innerHTML =
        "<p>검색 결과가 없습니다.</p>";
      return;
    }

    // 기존 검색 결과 초기화
    document.getElementById("search-results").innerHTML = "";

    // 새로운 데이터로 화면 업데이트
    renderResults(data.item);

    // 페이지네이션 업데이트
    paginationRender(data.totalResults, currentPage, query);
  } catch (error) {
    console.error("API 요청 실패:", error);
  }
}

// 화질 개선 함수
async function getHighResCover(url) {
  if (!url) return "";

  const highResUrl = url.replace("/coversum/", "/cover600");
  const fallbackUrl = url.replace("/coversum", "/cover500");

  return new Promise((resolve) => {
    const img = new Image();
    img.src = highResUrl;
    img.onload = () => resolve(highResUrl);
    img.onerror = () => resolve(fallbackUrl);
  });
}

// 화면 렌더링 함수
async function renderResults(books) {
  const bookContainer = document.getElementById("search-results");

  console.log("화면 렌더링: 새로운 데이터 적용됨");
  console.log("렌더링할 아이템 개수:", books.length);

  // 기존 검색 결과 초기화
  bookContainer.innerHTML = "";

  for (const book of books) {
    const lowResCover = book.cover.replace("/coversum/", "/cover130"); // 저해상도 우선 표시
    const bookElement = document.createElement("div");
    bookElement.classList.add("search_book-card");
    bookElement.innerHTML = `
        <div class="book-card">
          <img class="book-cover" src="${lowResCover}" alt="${book.title}">
          <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">${book.author || "저자 정보 없음"}</p>
            <p class="book-publisher">${
              book.publisher || "출판사 정보 없음"
            }</p>
          </div>
        </div>
      `;
    bookContainer.appendChild(bookElement);

    // 고해상도 이미지 로드 후 교체
    getHighResCover(book.cover).then((highResCover) => {
      bookElement.querySelector(".book-cover").src = highResCover;
    });
  }
}

// 페이지 로드 시 검색 결과 가져오기
window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");

  if (query) {
    getSearchResults();
    getTopRatedBooks(query);
  }
};

// 페이지네이션 함수
const MAX_PAGE_LIMIT = 10; // 10페이지까지만 허용

function paginationRender(totalResults, currentPage, query) {
  const pageSize = 20; // 한 페이지당 검색 결과 수
  const totalPage = Math.min(
    Math.ceil(totalResults / pageSize),
    MAX_PAGE_LIMIT
  ); // 최대 10페이지까지만

  const pageGroup = Math.ceil(currentPage / 5);
  const lastPage = Math.min(totalPage, pageGroup * 5);
  const firstPage = Math.max(1, lastPage - 4);

  let paginationHTML = "";

  // 처음 페이지 버튼
  paginationHTML += `
    <li class="${currentPage === 1 ? "disabled" : ""}">
      <a class="first" onclick="moveToPage(1)">처음 페이지;</a>
    </li>`;

  // 이전 페이지 버튼
  paginationHTML += `
    <li class="${currentPage === 1 ? "disabled" : ""}">
      <a class="arrow-left" onclick="moveToPage(${Math.max(
        1,
        currentPage - 1
      )})">&lt;</a>
    </li>`;

  // 페이지 번호
  for (let i = firstPage; i <= lastPage; i++) {
    paginationHTML += `
    <li>
      <a class="num ${
        i === currentPage ? "active" : ""
      }" onclick="moveToPage(${i})">${i}</a>
    </li>`;
  }

  // 다음 페이지 버튼
  paginationHTML += `
    <li class="${currentPage === totalPage ? "disabled" : ""}">
      <a class="arrow-right" onclick="moveToPage(${Math.min(
        totalPage,
        currentPage + 1
      )})">&gt;</a>
    </li>`;

  // 끝 페이지 버튼
  paginationHTML += `
    <li class="${currentPage === totalPage ? "disabled" : ""}">
      <a class="last" onclick="moveToPage(${totalPage})">끝 페이지</a>
    </li>`;

  document.querySelector(".search-result_pagination").innerHTML =
    paginationHTML;
}

// 페이지 이동 함수
const moveToPage = (pageNum) => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("page", pageNum);
  window.history.pushState({}, "", `?${urlParams.toString()}`);

  console.log("페이지 이동: ", pageNum);
  window.scrollTo(0, 0); // 페이지 이동 시 화면 상단으로 이동
  getSearchResults();
};

//평점 높은 책 추천 슬라이더

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");
  let currentPage = parseInt(urlParams.get("page")) || 1;

  console.log("현재 페이지:", currentPage);

  if (query) {
    const titleElement = document.querySelector(".search_best_title");
    if (titleElement) {
      titleElement.innerHTML = `📚 <strong>"${query}"</strong>의 베스트 도서`;
    }
  }

  if (query) {
    getSearchResults();
    getTopRatedBooks(query);
  }
});

async function getTopRatedBooks(query) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("apiType", "ItemSearch");
    searchParams.set("Query", query);
    searchParams.set("QueryType", "Title");
    searchParams.set("MaxResults", "10");
    searchParams.set("Sort", "SalesPoint"); // 판매 높은 순 정렬
    searchParams.set("SearchTarget", "Book");

    const url = `/.netlify/functions/api-proxy?${searchParams.toString()}`;
    console.log("평점 높은 책 API 요청 URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log("평점 높은 책 응답 데이터:", data);

    const topRatedContainer = document.querySelector(
      ".header_top-rated-container"
    );

    // 검색 결과가 10개 미만이면 베스트셀러 슬라이드 숨김
    if (!data.item || data.item.length < 10) {
      topRatedContainer.style.display = "none";
      return;
    }

    // 10개 이상이면 보이도록 설정
    topRatedContainer.style.display = "block";
    renderTopRatedSlider(data.item);
  } catch (error) {
    console.error("평점 높은 책 API 요청 실패:", error);
  }
}

function renderTopRatedSlider(books) {
  const sliderContainer = document.getElementById("header_top-rated-slider");
  sliderContainer.innerHTML = ""; // 기존 내용 초기화

  books.forEach((book) => {
    const lowResCover = book.cover.replace("/coversum/", "/cover130");

    const bookElement = document.createElement("div");
    bookElement.classList.add("header_top-rated-book");
    bookElement.innerHTML = `
      <img class="book-cover" src="${lowResCover}" alt="${book.title}">
      <h3>${book.title}</h3>
    `;
    sliderContainer.appendChild(bookElement);

    // 고해상도 이미지 로드 후 교체
    getHighResCover(book.cover).then((highResCover) => {
      bookElement.querySelector(".book-cover").src = highResCover;
    });
  });

  setTimeout(() => {
    const $slider = $(".multiple-items");

    // Slick Slider 초기화 전에 한 번 제거해서 새로 적용
    if ($slider.hasClass("slick-initialized")) {
      $slider.slick("unslick");
    }

    $slider.slick({
      infinite: true,
      slidesToShow: 5,
      slidesToScroll: 2,
      autoplay: true,
      autoplaySpeed: 3000,
      dots: true,
      arrows: true,
      prevArrow: '<button type="button" class="slick-prev">&lt;</button>', // 이전 버튼 스타일
      nextArrow: '<button type="button" class="slick-next">&gt;</button>', // 다음 버튼 스타일
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });
  }, 500);
}
