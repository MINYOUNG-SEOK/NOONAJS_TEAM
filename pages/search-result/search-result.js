async function getSearchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");
  const sortBy = urlParams.get("sort") || "Accuracy";
  let currentPage = parseInt(urlParams.get("page")) || 1;

  console.log("현재 페이지:", currentPage, "정렬 기준:", sortBy);

  if (!query) {
    document.querySelector("#search-results").innerHTML =
      "<p>검색어가 없습니다.</p>";
    return;
  }

  try {
    const searchParams = new URLSearchParams();
    searchParams.set("apiType", "ItemSearch");
    searchParams.set("Query", query);
    searchParams.set("QueryType", "Title");
    searchParams.set("MaxResults", "20");
    searchParams.set("start", currentPage);
    searchParams.set("SearchTarget", "Book");
    searchParams.set("Sort", sortBy);
    searchParams.set("Cover", "Big");

    const url = `/.netlify/functions/api-proxy?${searchParams.toString()}`;
    console.log("검색 API 요청 URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    if (!data.item || data.item.length === 0) {
      document.getElementById("search-results").innerHTML =
        "<p>검색 결과가 없습니다.</p>";
      return;
    }

    document.getElementById("book-list").innerHTML = "";
    renderResults(data.item);
    paginationRender(data.totalResults, currentPage, query);
  } catch (error) {
    console.error("API 요청 실패:", error);
  }
}

// 정렬 필터 이벤트 리스너 (데스크탑 + 모바일)
document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".sort-options .nav-link");
  const dropdownItems = document.querySelectorAll(".dropdown-item");

  function updateActiveSort(selectedSort) {
    // 데스크탑 정렬 필터 업데이트
    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.sort === selectedSort) item.classList.add("active");
    });

    // 모바일 정렬 필터 업데이트
    dropdownItems.forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.sort === selectedSort) item.classList.add("active");
    });

    // 드롭다운 버튼에 선택한 정렬 기준 표시
    document.getElementById("sortDropdown").innerText = document.querySelector(
      `.dropdown-item[data-sort="${selectedSort}"]`
    ).innerText;
  }

  function handleSortClick(event) {
    event.preventDefault();
    const selectedSort = event.target.dataset.sort;

    // 정렬 시 page를 1로 리셋
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("sort", selectedSort);
    urlParams.set("page", "1");
    window.history.pushState({}, "", `?${urlParams.toString()}`);

    updateActiveSort(selectedSort);
    getSearchResults();
  }

  navItems.forEach((item) => item.addEventListener("click", handleSortClick));
  dropdownItems.forEach((item) =>
    item.addEventListener("click", handleSortClick)
  );

  // 드롭다운 버튼 클릭 시 드롭다운 메뉴 보이기
  document
    .getElementById("sortDropdown")
    .addEventListener("click", function (event) {
      event.stopPropagation();
      document.getElementById("dropdownMenu").classList.toggle("show");
    });

  // 클릭 외의 영역을 누르면 드롭다운 닫기
  window.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
      document.getElementById("dropdownMenu").classList.remove("show");
    }
  });
});

// 페이지 로드 시 검색 결과 가져오기
window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");

  if (query) {
    getSearchResults();
    getTopRatedBooks(query);
  }
};

// 화면 렌더링 함수
async function renderResults(books) {
  const bookContainer = document.getElementById("book-list");

  console.log("화면 렌더링: 새로운 데이터 적용됨");
  console.log("렌더링할 아이템 개수:", books.length);

  // 기존 검색 결과 초기화
  bookContainer.innerHTML = "";

  for (const book of books) {
    const bookElement = document.createElement("div");
    bookElement.classList.add("book-card");
    bookElement.addEventListener("click", () => {
      window.location.href = `../book-detail/detail.html?itemId=${book.itemId}`;
    });
    bookElement.innerHTML = `
      <img class="book-cover" src="${book.cover}" alt="${book.title}">
      <h3 class="categories-title">${book.title}</h3>
      <p class="categories-author">${book.author || "저자 정보 없음"}</p>
    `;

    bookContainer.appendChild(bookElement);
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
  if (currentPage > 1) {
    paginationHTML = `<li class="category-page-item" onclick="moveToPage(1)"><a class="category-page-link"href="#top">«</a></li>
        <li class="category-page-item" onclick="moveToPage(${
          currentPage - 1
        })"><a class="category-page-link"href="#top">‹</a></li>`;
  }

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
  if (currentPage < totalPage) {
    paginationHTML += `<li class="category-page-item" onclick="moveToPage(${
      currentPage + 1
    })"><a class="category-page-link"href="#top">›</a></li><li class="category-page-item" onclick="moveToPage(${totalPage})"><a class="category-page-link" href="#top">»</a></li>`;
  }

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
    searchParams.set("Cover", "Big");

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
    const bookElement = document.createElement("div");
    bookElement.addEventListener("click", () => {
      window.location.href = `../book-detail/detail.html?itemId=${book.itemId}`;
    });
    bookElement.classList.add("header_top-rated-book");
    bookElement.innerHTML = `
      <img class="book-cover" src="${book.cover}" alt="${book.title}">
      <h3>${book.title}</h3>
    `;
    sliderContainer.appendChild(bookElement);
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
      dots: false,
      arrows: false,
      prevArrow: $(".slick-prev"), // ✅ 직접 만든 버튼 연결
      nextArrow: $(".slick-next"), // ✅ 직접 만든 버튼 연결
      responsive: [
        {
          breakpoint: 950,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 2,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
      ],
    });

    // 🔥 버튼이 사라지지 않도록 .hide() 삭제!
    $(".slick-prev, .slick-next").show();

    // 🔥 직접 만든 버튼을 클릭하면 슬라이드가 동작하도록 설정
    document.querySelector(".slick-prev").addEventListener("click", () => {
      $slider.slick("slickPrev");
    });

    document.querySelector(".slick-next").addEventListener("click", () => {
      $slider.slick("slickNext");
    });
  }, 500);
}

document.addEventListener("DOMContentLoaded", function () {
  getEditorSuggestedBook();
});
