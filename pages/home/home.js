document.addEventListener("DOMContentLoaded", function () {
  const API_KEY = "ttbchuo_o1910001 ";
  let page = 1;
  const pageSize = 50;
  let totalResults = 0;

  const categoryMap = {
    전체: 0,
    문학: 1,
    에세이: 55,
    자기계발: 336, // 자기계발
    교양: 119, // 인문학을 교양의 대표 카테고리로 설정
    라이프스타일: 1230, // 가정/요리/뷰티를 라이프스타일의 대표 카테고리로 설정
  };

  // 메인 배너 이미지 순환
  initBannerRotation();

  // 페이지 로드 시 데이터 불러오기
  fetchBestsellers();
  fetchNewReleases();
  fetchCategoryBestsellers(0); // 기본 카테고리: 전체

  // 카테고리 탭 클릭 이벤트 설정
  const categoryTabs = document.querySelectorAll(
    ".home-category-bestseller .home-category-item"
  );
  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      categoryTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const categoryId = this.getAttribute("data-category-id") || 0;
      fetchCategoryBestsellers(categoryId);
    });
  });

  // 배너 이미지 순환 기능
  function initBannerRotation() {
    const images = [
      "./images/banner1.png",
      "./images/banner2.png",
      "./images/banner3.png",
      "./images/banner4.png",
      "./images/banner5.png",
      "./images/banner6.png",
      "./images/banner7.png",
      "./images/banner8.png",
      "./images/banner9.png",
      "./images/banner10.png",
    ];
    let currentIndex = 0;
    const imageElement = document.getElementById("bannerImage");

    if (!imageElement) return;

    function changeImage() {
      currentIndex = (currentIndex + 1) % images.length;
      imageElement.classList.remove("home-fade-in");
      setTimeout(() => {
        imageElement.src = images[currentIndex];
        imageElement.classList.add("home-fade-in");
      }, 300);
    }

    setInterval(changeImage, 4000);
  }

  // 베스트셀러 데이터 가져오기
  async function fetchBestsellers() {
    try {
      const url = new URL("http://www.aladin.co.kr/ttb/api/ItemList.aspx");
      url.searchParams.set("ttbkey", API_KEY);
      url.searchParams.set("QueryType", "Bestseller");
      url.searchParams.set("MaxResults", pageSize);
      url.searchParams.set("start", page);
      url.searchParams.set("SearchTarget", "Book");
      url.searchParams.set("output", "js");
      url.searchParams.set("Version", "20131101");
      url.searchParams.set("Cover", "Big");

      const data = await fetchAladinAPI(url);

      if (data) {
        displayBestsellerBooks(data.item);
        totalResults = data.totalResults;

        // 베스트셀러 슬라이더 초기화
        initFeaturedSlider(
          "bestsellerSlider",
          "prevBtn",
          "nextBtn",
          "pageInfo",
          {
            featuredImage: "featuredImage",
            featuredTitle: "featuredTitle",
            featuredAuthor: "featuredAuthor",
            featuredDescription: "featuredDescription",
          },
          3000
        );
      }
    } catch (error) {
      console.error("베스트셀러 데이터를 가져오는 중 오류 발생:", error);
      errorRender("베스트셀러", error.message);
    }
  }

  // 신작 도서 데이터 가져오기
  async function fetchNewReleases() {
    try {
      const url = new URL("http://www.aladin.co.kr/ttb/api/ItemList.aspx");
      url.searchParams.set("ttbkey", API_KEY);
      url.searchParams.set("QueryType", "ItemNewAll");
      url.searchParams.set("MaxResults", pageSize);
      url.searchParams.set("start", page);
      url.searchParams.set("SearchTarget", "Book");
      url.searchParams.set("output", "js");
      url.searchParams.set("Version", "20131101");
      url.searchParams.set("Cover", "Big");

      const data = await fetchAladinAPI(url);

      if (data) {
        displayNewReleaseBooks(data.item);

        // 신작 도서 슬라이더 초기화
        initInfiniteSlider(
          "newReleaseSlider",
          "newPrevBtn",
          "newNextBtn",
          "newPageInfo",
          3000,
          "next"
        );
      }
    } catch (error) {
      console.error("신작 도서 데이터를 가져오는 중 오류 발생:", error);
      errorRender("신작 도서", error.message);
    }
  }

  // 전역 변수로 슬라이더 관련 정보 추적
  let categorySliderInterval = null;

  // 카테고리별 베스트셀러 데이터 가져오기
  async function fetchCategoryBestsellers(categoryId) {
    try {
      const url = new URL("http://www.aladin.co.kr/ttb/api/ItemList.aspx");
      url.searchParams.set("ttbkey", API_KEY);
      url.searchParams.set("QueryType", "Bestseller");
      url.searchParams.set("MaxResults", pageSize);
      url.searchParams.set("start", page);
      url.searchParams.set("SearchTarget", "Book");
      url.searchParams.set("CategoryId", categoryId);
      url.searchParams.set("output", "js");
      url.searchParams.set("Version", "20131101");
      url.searchParams.set("Cover", "Big");

      const data = await fetchAladinAPI(url);

      if (data) {
        displayCategoryBooks(data.item);

        // 카테고리별 베스트셀러 슬라이더 초기화
        initInfiniteSlider(
          "categorySlider",
          "catPrevBtn",
          "catNextBtn",
          "catPageInfo",
          3000,
          "next",
          true
        );
      }
    } catch (error) {
      console.error(
        "카테고리별 베스트셀러 데이터를 가져오는 중 오류 발생:",
        error
      );
      errorRender("카테고리별 베스트셀러", error.message);
    }
  }

  // 알라딘 API 호출 (JSONP 방식으로 CORS 우회)
  function fetchAladinAPI(url) {
    return new Promise((resolve, reject) => {
      const callbackName =
        "aladin_callback_" + Math.round(Math.random() * 1000000);

      window[callbackName] = function (data) {
        delete window[callbackName];
        document.body.removeChild(script);
        if (data.errorCode) {
          reject(
            new Error(data.errorMessage || "API 호출 중 오류가 발생했습니다.")
          );
        } else {
          resolve(data);
        }
      };

      const script = document.createElement("script");
      script.src = url.toString() + `&callback=${callbackName}`;
      script.onerror = () =>
        reject(new Error("API 호출 중 네트워크 오류가 발생했습니다."));
      document.body.appendChild(script);
    });
  }

  // 베스트셀러 도서 표시
  function displayBestsellerBooks(books) {
    if (!books || books.length === 0) {
      errorRender("베스트셀러", "검색 결과가 없습니다.");
      return;
    }

    const slider = document.getElementById("bestsellerSlider");
    if (!slider) return;

    // 기존 내용 초기화
    slider.innerHTML = "";

    // 각 책 항목 생성하여 슬라이더에 추가
    books.forEach((book, index) => {
      const bookItem = document.createElement("div");
      bookItem.className = "home-bestseller-slider__item";
      bookItem.setAttribute("data-index", index);

      bookItem.innerHTML = `
        <img src="${book.cover}" alt="${book.title}">
        <div class="home-book-info">
          <h3 class="home-slider-book-title">${book.title}</h3>
          <p class="home-slider-book-author">${book.author}</p>
          <p class="home-slider-book-description" style="display: none;">
            ${book.description || "내용 없음"}
          </p>
        </div>
      `;

      slider.appendChild(bookItem);
    });

    // 첫 번째 책을 대표 책으로 설정
    if (books.length > 0) {
      const featuredBook = books[0];
      const featuredImage = document.getElementById("featuredImage");
      const featuredTitle = document.getElementById("featuredTitle");
      const featuredAuthor = document.getElementById("featuredAuthor");
      const featuredDescription = document.getElementById(
        "featuredDescription"
      );

      if (featuredImage) featuredImage.src = featuredBook.cover;
      if (featuredTitle) featuredTitle.textContent = featuredBook.title;
      if (featuredAuthor)
        featuredAuthor.textContent = `${featuredBook.author} | 역자`;
      if (featuredDescription)
        featuredDescription.textContent =
          featuredBook.description || "내용 없음";
    }
  }

  // 신작 도서 표시
  function displayNewReleaseBooks(books) {
    if (!books || books.length === 0) {
      errorRender("신작 도서", "검색 결과가 없습니다.");
      return;
    }

    const slider = document.getElementById("newReleaseSlider");
    if (!slider) return;

    // 기존 내용 초기화
    slider.innerHTML = "";

    // 각 책 항목 생성하여 슬라이더에 추가
    books.forEach((book, index) => {
      const bookItem = document.createElement("div");
      bookItem.className = "home-bestseller-slider__item";
      bookItem.setAttribute("data-index", index);

      bookItem.innerHTML = `
        <img src="${book.cover}" alt="${book.title}">
        <div class="home-book-info">
          <h3 class="home-slider-book-title">${book.title}</h3>
          <p class="home-slider-book-author">${book.author}</p>
        </div>
      `;

      slider.appendChild(bookItem);
    });
  }

  // 카테고리별 베스트셀러 표시
  function displayCategoryBooks(books) {
    if (!books || books.length === 0) {
      errorRender("카테고리별 베스트셀러", "검색 결과가 없습니다.");
      return;
    }

    const slider = document.getElementById("categorySlider");
    if (!slider) return;

    // 기존 내용 초기화
    slider.innerHTML = "";

    // 각 책 항목 생성하여 슬라이더에 추가
    books.forEach((book, index) => {
      const bookItem = document.createElement("div");
      bookItem.className = "home-bestseller-slider__item";
      bookItem.setAttribute("data-index", index);

      bookItem.innerHTML = `
        <img src="${book.cover}" alt="${book.title}">
        <div class="home-book-info">
          <h3 class="home-slider-book-title">${book.title}</h3>
          <p class="home-slider-book-author">${book.author}</p>
        </div>
      `;

      slider.appendChild(bookItem);
    });
  }

  // 오류 메시지 표시
  function errorRender(section, errorMessage) {
    const errorHTML = `
      <div class="error-message">
        <p>${errorMessage}</p>
      </div>
    `;

    const sliderId =
      section === "베스트셀러"
        ? "bestsellerSlider"
        : section === "신작 도서"
        ? "newReleaseSlider"
        : "categorySlider";

    const slider = document.getElementById(sliderId);
    if (slider) {
      slider.innerHTML = errorHTML;
    }
  }

  // 메인 책 디스플레이 포함한 슬라이더 초기화
  function initFeaturedSlider(
    sliderId,
    prevBtnId,
    nextBtnId,
    pageInfoId,
    featuredElements,
    autoPlayInterval
  ) {
    const slider = document.getElementById(sliderId);
    const sliderItems = document.querySelectorAll(
      `#${sliderId} .home-bestseller-slider__item`
    );
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const pageInfo = document.getElementById(pageInfoId);

    // 메인 대표 책 정보 요소
    const featuredImage = document.getElementById(
      featuredElements.featuredImage
    );
    const featuredTitle = document.getElementById(
      featuredElements.featuredTitle
    );
    const featuredAuthor = document.getElementById(
      featuredElements.featuredAuthor
    );
    const featuredDescription = document.getElementById(
      featuredElements.featuredDescription
    );

    if (!slider || sliderItems.length === 0) {
      console.warn(`슬라이더 요소를 찾을 수 없습니다: ${sliderId}`);
      return;
    }

    let currentSlideIndex = 0;
    const totalSlides = sliderItems.length;
    const visibleSlidesCount = calculateVisibleSlidesCount(slider);
    const maxSlideIndex = Math.max(0, totalSlides - visibleSlidesCount);
    let featuredBookIndex = totalSlides - 1;

    // 도서 데이터 추출
    const bookData = extractBookData(sliderItems);
    setupInitialFeaturedBook();
    updateSlideInfo();

    // 자동 슬라이드 기능
    let autoSlideInterval = setInterval(() => autoSlide(), autoPlayInterval);

    // 이벤트 리스너 설정
    setupEventListeners();

    // 슬라이더 아이템 데이터 추출
    function extractBookData(items) {
      return Array.from(items).map((item) => {
        return {
          image: item.querySelector("img").src,
          title: item.querySelector(".home-slider-book-title").textContent,
          author: item.querySelector(".home-slider-book-author").textContent,
          description:
            item.querySelector(".home-slider-book-description")?.textContent ||
            "",
        };
      });
    }

    // 보이는 슬라이드 수 계산
    function calculateVisibleSlidesCount(slider) {
      return Math.floor((slider.parentElement.offsetWidth - 40) / (180 + 20));
    }

    // 초기 메인 책 설정
    function setupInitialFeaturedBook() {
      const visibleBookIndices = Array.from(
        { length: visibleSlidesCount },
        (_, i) => (currentSlideIndex + i) % totalSlides
      );

      for (let i = 0; i < bookData.length; i++) {
        if (!visibleBookIndices.includes(i % totalSlides)) {
          featuredBookIndex = i;
          break;
        }
      }

      if (featuredBookIndex < bookData.length) {
        updateFeaturedBook(featuredBookIndex);
      }
    }

    // 이벤트 리스너 설정
    function setupEventListeners() {
      // 이전 버튼
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentSlideIndex > 0) {
            swapFeaturedBook(currentSlideIndex - 1);
            currentSlideIndex--;
            updateSlider();
            resetAutoSlide();
          }
        });
      }

      // 다음 버튼
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (currentSlideIndex < maxSlideIndex) {
            swapFeaturedBook(currentSlideIndex);
            currentSlideIndex++;
            updateSlider();
            resetAutoSlide();
          }
        });
      }

      // 창 크기 변경 시 슬라이더 조정
      window.addEventListener("resize", () => {
        const newVisibleSlidesCount = calculateVisibleSlidesCount(slider);
        const newMaxSlideIndex = Math.max(
          0,
          totalSlides - newVisibleSlidesCount
        );

        if (currentSlideIndex > newMaxSlideIndex) {
          currentSlideIndex = newMaxSlideIndex;
        }

        updateSlider();
      });
    }

    // 자동 슬라이드 기능
    function autoSlide() {
      if (currentSlideIndex < maxSlideIndex) {
        swapFeaturedBook(currentSlideIndex);
        currentSlideIndex++;
        updateSlider();
      } else {
        currentSlideIndex = 0;
        updateSlider();
      }
    }

    // 자동 슬라이드 리셋
    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      autoSlideInterval = setInterval(autoSlide, autoPlayInterval);
    }

    // 슬라이더 위치 업데이트
    function updateSlider() {
      const itemWidth = sliderItems[0].offsetWidth + 40;
      slider.style.transition = "transform 0.6s ease";
      slider.style.transform = `translateX(-${
        currentSlideIndex * itemWidth
      }px)`;
      updateSlideInfo();
    }

    // 페이지 정보 업데이트
    function updateSlideInfo() {
      if (pageInfo) {
        pageInfo.textContent = `${currentSlideIndex + 1} / ${Math.min(
          totalSlides,
          maxSlideIndex + 1
        )}`;
      }
    }

    // 메인 책 업데이트
    function updateFeaturedBook(index) {
      const book = bookData[index];
      featuredImage.src = book.image;
      featuredTitle.textContent = book.title;
      featuredAuthor.textContent = book.author + " | 역자";
      featuredDescription.textContent = book.description;
    }

    // 메인 책과 슬라이더 책 교체
    function swapFeaturedBook(sliderIndex) {
      const selectedBookIndex = sliderIndex % totalSlides;

      featuredImage.classList.remove("home-fade-in");

      setTimeout(() => {
        updateFeaturedBook(selectedBookIndex);
        featuredBookIndex = selectedBookIndex;
        featuredImage.classList.add("home-fade-in");
      }, 300);
    }
  }

  // 무한 슬라이더 초기화 함수
  function initInfiniteSlider(
    sliderId,
    prevBtnId,
    nextBtnId,
    pageInfoId,
    autoPlayInterval,
    defaultDirection,
    reverseButtons
  ) {
    const slider = document.getElementById(sliderId);
    const sliderItems = document.querySelectorAll(
      `#${sliderId} .home-bestseller-slider__item`
    );
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const pageInfo = document.getElementById(pageInfoId);

    if (!slider || sliderItems.length === 0) {
      console.warn(`슬라이더 요소를 찾을 수 없습니다: ${sliderId}`);
      return;
    }

    // 무한 슬라이드를 위한 요소 복제
    setupInfiniteSlider();

    let currentIndex = 0;
    const itemsCount = sliderItems.length;

    // 자동 슬라이드 설정
    let autoSlideInterval = setInterval(() => {
      slide(defaultDirection);
    }, autoPlayInterval);

    // 이벤트 리스너 설정
    setupEventListeners();

    // 무한 슬라이드 설정
    function setupInfiniteSlider() {
      // 원본 슬라이드 앞뒤로 복제
      const cloneFirst = Array.from(sliderItems, (item) =>
        item.cloneNode(true)
      );
      const cloneLast = Array.from(sliderItems, (item) => item.cloneNode(true));

      cloneFirst.forEach((item) => slider.appendChild(item));
      cloneLast.forEach((item) => slider.insertBefore(item, slider.firstChild));

      // 초기 위치 설정
      const itemWidth = sliderItems[0].offsetWidth + 40;
      slider.style.transform = `translateX(-${
        sliderItems.length * itemWidth
      }px)`;
      slider.style.transition = "none";

      // 리플로우 강제
      slider.offsetHeight;
    }

    // 이벤트 리스너 설정
    function setupEventListeners() {
      // 이전 버튼
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          const direction = reverseButtons
            ? defaultDirection
            : defaultDirection === "next"
            ? "prev"
            : "next";
          slide(direction);
          resetAutoSlide();
        });
      }

      // 다음 버튼
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          const direction = reverseButtons
            ? defaultDirection === "next"
              ? "prev"
              : "next"
            : defaultDirection;
          slide(direction);
          resetAutoSlide();
        });
      }

      // 터치 이벤트 처리
      let touchStartX = 0;
      let touchEndX = 0;

      slider.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );

      slider.addEventListener(
        "touchend",
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        },
        { passive: true }
      );

      function handleSwipe() {
        if (slider.style.pointerEvents === "none") return;

        const SWIPE_THRESHOLD = 50;
        const isLeftSwipe = touchEndX < touchStartX - SWIPE_THRESHOLD;
        const isRightSwipe = touchEndX > touchStartX + SWIPE_THRESHOLD;

        if (defaultDirection === "next") {
          // 왼쪽→오른쪽 슬라이더
          if (isLeftSwipe) {
            slide("next");
            resetAutoSlide();
          } else if (isRightSwipe) {
            slide("prev");
            resetAutoSlide();
          }
        } else {
          // 오른쪽→왼쪽 슬라이더
          if (isLeftSwipe) {
            slide("prev");
            resetAutoSlide();
          } else if (isRightSwipe) {
            slide("next");
            resetAutoSlide();
          }
        }
      }
    }

    // 슬라이드 이동 함수
    function slide(direction) {
      if (!slider || sliderItems.length === 0) return;

      const containerHeight = slider.parentElement.offsetHeight;
      slider.parentElement.style.height = `${containerHeight}px`;

      slider.style.pointerEvents = "none";
      slider.style.transition = "transform 0.6s ease";

      const itemWidth = sliderItems[0].offsetWidth + 40;

      if (direction === "next") {
        currentIndex++;
        slider.style.transform = `translateX(-${
          (sliderItems.length + currentIndex) * itemWidth
        }px)`;

        // 마지막 슬라이드 도달 시 처음으로 점프
        if (currentIndex === itemsCount) {
          setTimeout(() => {
            slider.style.transition = "none";
            currentIndex = 0;
            slider.style.transform = `translateX(-${
              sliderItems.length * itemWidth
            }px)`;
            slider.offsetHeight; // 리플로우 강제
            slider.style.pointerEvents = "auto";
          }, 600);
        } else {
          setTimeout(() => {
            slider.style.pointerEvents = "auto";
          }, 600);
        }
      } else {
        currentIndex--;
        slider.style.transform = `translateX(-${
          (sliderItems.length + currentIndex) * itemWidth
        }px)`;

        // 첫 슬라이드 이전 도달 시 마지막으로 점프
        if (currentIndex === -1) {
          setTimeout(() => {
            slider.style.transition = "none";
            currentIndex = itemsCount - 1;
            slider.style.transform = `translateX(-${
              (sliderItems.length + currentIndex) * itemWidth
            }px)`;
            slider.offsetHeight; // 리플로우 강제
            slider.style.pointerEvents = "auto";
          }, 600);
        } else {
          setTimeout(() => {
            slider.style.pointerEvents = "auto";
          }, 600);
        }
      }

      updateSlideInfo();
    }

    // 자동 슬라이드 리셋
    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      autoSlideInterval = setInterval(() => {
        slide(defaultDirection);
      }, autoPlayInterval);
    }

    // 페이지 정보 업데이트
    function updateSlideInfo() {
      if (pageInfo) {
        const pageNumber =
          (((currentIndex % itemsCount) + itemsCount) % itemsCount) + 1;
        pageInfo.textContent = `${pageNumber} / ${itemsCount}`;
      }
    }
  }
});
