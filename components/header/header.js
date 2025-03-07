document.addEventListener("headerLoaded", function () {
  console.log("헤더 로드 완료, 이벤트 리스너 설정 시작"); //디버깅용 콘솔

  const searchBox = document.getElementById("header_searchBox");
  const searchIcon = document.querySelector(".header_search-icon");
  const closeBtn = document.querySelector(".closeBtn");

  if (!searchBox || !searchIcon || !closeBtn) {
    console.error("검색 모달 요소를 찾을 수 없습니다."); //디버깅용 콘솔
    return;
  }

  function openSearch() {
    console.log("검색창 열기"); //디버깅용 콘솔
    searchBox.style.display = "flex";
    setTimeout(() => {
      searchBox.classList.add("active");
    }, 10);
  }

  function closeSearch() {
    console.log("검색창 닫기"); //디버깅용 콘솔
    searchBox.classList.remove("active");
    setTimeout(() => {
      searchBox.style.display = "none";
    }, 300);
  }

  //기존에 이벤트가 중복 등록되지 않도록 체크 후 다시 추가
  searchIcon.removeEventListener("click", openSearch);
  closeBtn.removeEventListener("click", closeSearch);
  searchIcon.addEventListener("click", openSearch);
  closeBtn.addEventListener("click", closeSearch);
});

async function searchBooks() {
  const query = document.getElementById("search-input").value;
  if (!query) {
    console.warn("⚠️ 검색어가 입력되지 않았습니다.");
    return;
  }

  // 검색어를 포함한 URL로 이동 => search-result.html로 이동
  window.location.href = `/pages/search-result/search-result.html?query=${encodeURIComponent(
    query
  )}`;
}

async function getEditorSuggestedBook() {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("apiType", "ItemList");
    searchParams.set("QueryType", "BlogBest"); // ✅ 편집자 추천 API
    searchParams.set("MaxResults", "5");
    searchParams.set("start", "1");
    searchParams.set("SearchTarget", "Book");
    searchParams.set("CategoryId", "0"); // ✅ 카테고리 필수 (0 = 전체)

    const url = `/.netlify/functions/api-proxy?${searchParams.toString()}`;
    console.log("📌 API 요청 URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    console.log("📌 API 응답 데이터:", data);

    if (!data.item || data.item.length === 0) {
      console.warn("⚠️ 편집자 추천 도서를 찾을 수 없습니다.");
      document.getElementById("header_suggestedBook_title").innerHTML =
        "<p>편집자 추천 도서를 찾을 수 없습니다.</p>";
      return;
    }

    renderEditorChoiceResults(data.item);
  } catch (error) {
    console.error("❌ API 요청 실패:", error);
  }
}

async function renderEditorChoiceResults(books) {
  const bookContainer = document.getElementById("header_suggestedBook_title");

  // 기존 텍스트 유지하고 추천 키워드 추가
  bookContainer.innerHTML = `<strong>오늘의 추천 책:</strong> `;

  books.forEach((book) => {
    const bookElement = document.createElement("span");
    bookElement.classList.add("suggested-keyword"); // 스타일 적용을 위해 추가
    bookElement.innerHTML = `${book.title}`;
    bookElement.setAttribute("onclick", `searchSuggested('${book.title}')`); // ✅ 따옴표 추가하여 오류 해결
    bookContainer.appendChild(bookElement);
  });
}

function searchSuggested(keyword) {
  console.log(`추천 검색어 클릭됨: ${keyword}`);
  document.getElementById("search-input").value = keyword; // 검색창에 값 입력
  searchBooks(); // 검색 실행
}

window.onload = function () {
  getEditorSuggestedBook();
};
