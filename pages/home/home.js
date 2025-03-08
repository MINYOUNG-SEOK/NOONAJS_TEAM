document.addEventListener("DOMContentLoaded", function () {
  const API_KEY = "ttbssh75202319001";
  let page = 1;
  const pageSize = 20;
  let categorySliderInterval = null;
  let newReleaseSliderInterval = null;

  const categoryMap = {
    전체: 0,
    문학: 1,
    에세이: 55889,
    자기계발: 336,
    교양: 656,
    라이프스타일: 1230,
  };

  // 메인 배너 이미지 순환
  initBannerRotation();

  // 페이지 로드 시 기본 데이터 불러오기
  fetchBestsellers();
  fetchNewReleasesByCategory(1);
  fetchCategoryBestsellers(1);

  // 신작 도서 탭 클릭 이벤트 처리
  const newCategoryTabs = document.querySelectorAll(
    ".new-release-category-nav .home-new-category-item"
  );
  newCategoryTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      newCategoryTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const categoryId = parseInt(this.getAttribute("data-category-id"), 10);
      resetNewReleaseSlider();
      setTimeout(() => {
        newReleaseSliderInterval = initInfiniteSlider(
          "newReleaseSlider",
          "newPrevBtn",
          "newNextBtn",
          "newPageInfo",
          3000,
          "next",
          false
        );
        fetchNewReleasesByCategory(categoryId);
      }, 200);
    });
  });

  // 카테고리별 베스트셀러 탭 클릭 이벤트 처리
  const categoryTabs = document.querySelectorAll(
    ".home-category-bestseller .home-category-nav .home-category-item"
  );
  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      categoryTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const categoryId = parseInt(this.getAttribute("data-category-id"), 10);
      resetCategorySlider();
      fetchCategoryBestsellers(categoryId);
    });
  });

  // 슬라이더 리셋 함수들
  function resetCategorySlider() {
    if (categorySliderInterval) {
      clearInterval(categorySliderInterval);
      categorySliderInterval = null;
    }
    const slider = document.getElementById("categorySlider");
    if (!slider) return;
    slider.style.transition = "none";
    slider.style.transform = "translateX(0)";
    slider.innerHTML = "";
  }

  function resetNewReleaseSlider() {
    if (newReleaseSliderInterval) {
      clearInterval(newReleaseSliderInterval);
      newReleaseSliderInterval = null;
    }
    const slider = document.getElementById("newReleaseSlider");
    if (!slider) return;
    slider.style.transition = "none";
    slider.style.transform = "translateX(0)";
    slider.innerHTML = "";
  }

  // 메인 배너 이미지 순환
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
    const indicatorsContainer = document.getElementById("bannerIndicators");
    let slideInterval = null;

    if (!imageElement || !indicatorsContainer) return;

    // 인디케이터 생성
    images.forEach((_, index) => {
      const indicator = document.createElement("div");
      indicator.className = `home-banner-indicator ${
        index === 0 ? "active" : ""
      }`;
      indicator.setAttribute("data-index", index);
      indicator.addEventListener("click", () => {
        if (currentIndex !== index) {
          currentIndex = index;
          updateBanner();
          resetAutoSlide();
        }
      });
      indicatorsContainer.appendChild(indicator);
    });

    // 배너 업데이트 함수
    function updateBanner() {
      // 인디케이터 업데이트
      const indicators = document.querySelectorAll(".home-banner-indicator");
      indicators.forEach((ind, idx) => {
        if (idx === currentIndex) {
          ind.classList.add("active");
        } else {
          ind.classList.remove("active");
        }
      });

      // 이미지 업데이트
      imageElement.classList.remove("home-fade-in");
      setTimeout(() => {
        imageElement.src = images[currentIndex];
        imageElement.classList.add("home-fade-in");
      }, 300);
    }

    // 자동 슬라이드
    function changeImage() {
      currentIndex = (currentIndex + 1) % images.length;
      updateBanner();
    }

    // 타이머 재설정 함수
    function resetAutoSlide() {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
      slideInterval = setInterval(changeImage, 3000);
    }

    // 초기 타이머 설정
    resetAutoSlide();

    // 배너에 마우스 오버시 자동 슬라이드 일시 정지
    const bannerSection = document.querySelector(".home-banner");
    if (bannerSection) {
      bannerSection.addEventListener("mouseenter", () => {
        clearInterval(slideInterval);
        slideInterval = null;
      });

      bannerSection.addEventListener("mouseleave", () => {
        resetAutoSlide();
      });
    }
  }

  // 베스트셀러 (상단 큰 영역) 데이터 로드
  async function fetchBestsellers() {
    const categories = [1, 55889, 336, 656, 1230];
    const bestsellerBooks = [];
    for (const catId of categories) {
      try {
        const url = new URL("https://www.aladin.co.kr/ttb/api/ItemList.aspx");
        url.searchParams.set("ttbkey", API_KEY);
        url.searchParams.set("QueryType", "Bestseller");
        url.searchParams.set("MaxResults", pageSize);
        url.searchParams.set("start", page);
        url.searchParams.set("SearchTarget", "Book");
        url.searchParams.set("CategoryId", catId);
        url.searchParams.set("output", "js");
        url.searchParams.set("Version", "20131101");
        url.searchParams.set("Cover", "Big");
        const data = await fetchAladinAPI(url);
        if (data && data.item) {
          const categoryBooks = data.item.slice(0, 6);
          bestsellerBooks.push(...categoryBooks);
        }
      } catch (error) {
        console.error("베스트셀러 데이터 오류:", error);
      }
    }
    const uniqueBooks = Array.from(
      new Set(bestsellerBooks.map((b) => b.itemId))
    )
      .map((id) => bestsellerBooks.find((b) => b.itemId === id))
      .slice(0, 30);
    if (uniqueBooks.length > 0) {
      displayBestsellerBooks(uniqueBooks);
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
    } else {
      errorRender("베스트셀러", "검색 결과가 없습니다.");
    }
  }

  // 카테고리별 베스트셀러 (하단 탭) 데이터 로드
  async function fetchCategoryBestsellers(categoryId) {
    const items = await fetchSingleCategoryBestseller(categoryId);
    displayCategoryBooks(items);
    setTimeout(() => {
      initInfiniteSlider(
        "categorySlider",
        "catPrevBtn",
        "catNextBtn",
        "catPageInfo",
        3000,
        "next",
        false
      );
    }, 50);
  }

  async function fetchSingleCategoryBestseller(catId) {
    try {
      const url = new URL("https://www.aladin.co.kr/ttb/api/ItemList.aspx");
      url.searchParams.set("ttbkey", API_KEY);
      url.searchParams.set("QueryType", "Bestseller");
      url.searchParams.set("MaxResults", pageSize);
      url.searchParams.set("start", page);
      url.searchParams.set("SearchTarget", "Book");
      url.searchParams.set("CategoryId", catId);
      url.searchParams.set("output", "js");
      url.searchParams.set("Version", "20131101");
      url.searchParams.set("Cover", "Big");
      const data = await fetchAladinAPI(url);
      if (data && data.item) {
        return data.item.slice(0, 20);
      }
    } catch (error) {
      console.error("카테고리별 베스트셀러 호출 오류:", error);
    }
    return [];
  }

  // 신작 도서 – 카테고리 탭 처리
  async function fetchNewReleasesByCategory(categoryId) {
    if (newReleaseSliderInterval) {
      clearInterval(newReleaseSliderInterval);
      newReleaseSliderInterval = null;
    }

    const slider = document.getElementById("newReleaseSlider");
    if (slider) {
      slider.innerHTML = "";
      slider.style.transform = "translateX(0)";
    }

    if (categoryId === 0) {
      const catIds = [1, 55889, 336, 656, 1230];
      let allItems = [];
      for (const catId of catIds) {
        const items = await fetchSingleCategoryNewRelease(catId);
        allItems.push(...items);
      }
      const unique = Array.from(new Set(allItems.map((b) => b.itemId)))
        .map((id) => allItems.find((b) => b.itemId === id))
        .slice(0, 20);
      displayNewReleaseBooks(unique);
    } else {
      const items = await fetchSingleCategoryNewRelease(categoryId);
      displayNewReleaseBooks(items);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    newReleaseSliderInterval = initInfiniteSlider(
      "newReleaseSlider",
      "newPrevBtn",
      "newNextBtn",
      "newPageInfo",
      3000,
      "next",
      false
    );
  }

  async function fetchSingleCategoryNewRelease(catId) {
    try {
      const url = new URL("https://www.aladin.co.kr/ttb/api/ItemList.aspx");
      url.searchParams.set("ttbkey", API_KEY);
      url.searchParams.set("QueryType", "ItemNewAll");
      url.searchParams.set("MaxResults", pageSize);
      url.searchParams.set("start", page);
      url.searchParams.set("SearchTarget", "Book");
      url.searchParams.set("CategoryId", catId);
      url.searchParams.set("output", "js");
      url.searchParams.set("Version", "20131101");
      url.searchParams.set("Cover", "Big");
      const data = await fetchAladinAPI(url);
      if (data && data.item) {
        return data.item.slice(0, 20);
      }
    } catch (error) {
      console.error("카테고리별 신작도서 호출 오류:", error);
    }
    return [];
  }

  // API 호출 (JSONP 방식)
  function fetchAladinAPI(url) {
    return new Promise((resolve, reject) => {
      const callbackName =
        "aladin_callback_" + Math.round(Math.random() * 1000000);
      window[callbackName] = function (data) {
        delete window[callbackName];
        document.body.removeChild(script);
        if (data.errorCode) {
          reject(new Error(data.errorMessage || "API 오류"));
        } else {
          resolve(data);
        }
      };
      const script = document.createElement("script");
      script.src = url.toString() + `&callback=${callbackName}`;
      script.onerror = () => reject(new Error("네트워크 오류"));
      document.body.appendChild(script);
    });
  }

  // 도서 표시 함수들
  function displayBestsellerBooks(books) {
    const slider = document.getElementById("bestsellerSlider");
    if (!slider) return;
    if (!books || books.length === 0) {
      errorRender("베스트셀러", "검색 결과가 없습니다.");
      return;
    }
    slider.innerHTML = "";
    books.forEach((book, index) => {
      const bookItem = document.createElement("div");
      bookItem.className = "home-bestseller-slider__item";
      bookItem.setAttribute("data-index", index);
      bookItem.addEventListener("click", () => {
        window.location.href = `../book-detail/detail.html?itemId=${book.itemId}`;
      });
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

  function displayNewReleaseBooks(books) {
    const slider = document.getElementById("newReleaseSlider");
    if (!slider) return;
    if (!books || books.length === 0) {
      errorRender("신작 도서", "검색 결과가 없습니다.");
      return;
    }
    slider.innerHTML = "";
    books.forEach((book, index) => {
      const bookItem = document.createElement("div");
      bookItem.className = "home-bestseller-slider__item";
      bookItem.setAttribute("data-index", index);
      bookItem.addEventListener("click", () => {
        window.location.href = `../book-detail/detail.html?itemId=${book.itemId}`;
      });
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

  function displayCategoryBooks(books) {
    const slider = document.getElementById("categorySlider");
    if (!slider) return;
    if (!books || books.length === 0) {
      errorRender("카테고리별 베스트셀러", "검색 결과가 없습니다.");
      return;
    }
    slider.innerHTML = "";
    books.forEach((book, index) => {
      const bookItem = document.createElement("div");
      bookItem.className = "home-bestseller-slider__item";
      bookItem.setAttribute("data-index", index);
      bookItem.addEventListener("click", () => {
        window.location.href = `../book-detail/detail.html?itemId=${book.itemId}`;
      });
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

  // 오류 메시지 표시 함수
  function errorRender(section, errorMessage) {
    const sliderId =
      section === "베스트셀러"
        ? "bestsellerSlider"
        : section === "신작 도서"
        ? "newReleaseSlider"
        : "categorySlider";
    const slider = document.getElementById(sliderId);
    if (slider) {
      slider.innerHTML = `
        <div class="error-message">
          <p>${errorMessage}</p>
        </div>
      `;
    }
  }

  // 메인 책 디스플레이 포함한 슬라이더 초기화 함수
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

    // 대표책 영역
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

    // 진행 바
    const progressBar = document.getElementById("bestsellerProgressBar");

    if (!slider || sliderItems.length === 0) {
      console.warn(`슬라이더 요소가 없습니다: ${sliderId}`);
      return;
    }

    let currentSlideIndex = 0;
    const totalSlides = sliderItems.length;
    const visibleSlidesCount = calculateVisibleSlidesCount(slider);
    const maxSlideIndex = Math.max(0, totalSlides - visibleSlidesCount);

    // 자동 슬라이드
    let autoSlideIntervalId = setInterval(() => autoSlide(), autoPlayInterval);

    // 초기 대표책 셋업
    setupInitialFeaturedBook();

    // 이벤트 등록
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentSlideIndex > 0) {
          currentSlideIndex--;
          updateSlider();
          resetAutoSlide();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentSlideIndex < maxSlideIndex) {
          currentSlideIndex++;
          updateSlider();
          resetAutoSlide();
        }
      });
    }
    window.addEventListener("resize", () => {
      const newVisibleSlidesCount = calculateVisibleSlidesCount(slider);
      const newMaxSlideIndex = Math.max(0, totalSlides - newVisibleSlidesCount);
      if (currentSlideIndex > newMaxSlideIndex) {
        currentSlideIndex = newMaxSlideIndex;
      }
      updateSlider();
    });

    // 초기 슬라이드 세팅
    updateSlider();

    function setupInitialFeaturedBook() {
      // 첫 슬라이드 아이템을 대표책에 표시
      const bookData = extractBookData(sliderItems[0]);
      updateFeaturedBook(bookData);
    }

    function extractBookData(item) {
      return {
        image: item.querySelector("img")?.src,
        title: item.querySelector(".home-slider-book-title")?.textContent || "",
        author:
          item.querySelector(".home-slider-book-author")?.textContent || "",
        description:
          item.querySelector(".home-slider-book-description")?.textContent ||
          "",
      };
    }

    function updateFeaturedBook(bookData) {
      if (!bookData) return;
      // 페이드 인 효과를 위해 잠시 클래스 제거 후 다시 추가
      featuredImage.classList.remove("home-fade-in");
      setTimeout(() => {
        featuredImage.src = bookData.image;
        featuredTitle.textContent = bookData.title;
        featuredAuthor.textContent = bookData.author + " | 역자";
        featuredDescription.textContent = bookData.description;
        featuredImage.classList.add("home-fade-in");
      }, 200);
    }

    function calculateVisibleSlidesCount(sliderElement) {
      const itemWidth = 160 + 30;
      return Math.floor(
        (sliderElement.parentElement.offsetWidth - 40) / itemWidth
      );
    }

    function autoSlide() {
      if (currentSlideIndex < maxSlideIndex) {
        currentSlideIndex++;
      } else {
        currentSlideIndex = 0;
      }
      updateSlider();
    }

    function resetAutoSlide() {
      clearInterval(autoSlideIntervalId);
      autoSlideIntervalId = setInterval(() => autoSlide(), autoPlayInterval);
    }

    function updateSlider() {
      // 슬라이더 이동
      const itemWidth = sliderItems[0].offsetWidth + 30;
      slider.style.transition = "transform 0.6s ease";
      slider.style.transform = `translateX(-${
        currentSlideIndex * itemWidth
      }px)`;

      // 대표책 갱신
      const currentBookData = extractBookData(
        sliderItems[currentSlideIndex] || sliderItems[0]
      );
      updateFeaturedBook(currentBookData);

      // 페이지 정보 갱신
      updatePageInfo();

      // 진행 바 업데이트
      updateProgressBar();
    }

    function updatePageInfo() {
      if (!pageInfo) return;
      pageInfo.textContent = `${currentSlideIndex + 1} / ${maxSlideIndex + 1}`;
    }

    function updateProgressBar() {
      if (!progressBar) return;
      const progressRatio =
        maxSlideIndex === 0 ? 1 : currentSlideIndex / maxSlideIndex;
      progressBar.style.width = `${progressRatio * 100}%`;
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
    setupInfiniteSlider();
    let currentIndex = 0;
    const itemsCount = sliderItems.length;
    let autoSlideIntervalId = setInterval(() => {
      slide(defaultDirection);
    }, autoPlayInterval);
    if (sliderId === "categorySlider") {
      categorySliderInterval = autoSlideIntervalId;
    }
    setupEventListeners();

    function setupInfiniteSlider() {
      const cloneFirst = Array.from(sliderItems, (item) =>
        item.cloneNode(true)
      );
      const cloneLast = Array.from(sliderItems, (item) => item.cloneNode(true));
      cloneFirst.forEach((item) => slider.appendChild(item));
      cloneLast.forEach((item) => slider.insertBefore(item, slider.firstChild));
      setTimeout(() => {
        const itemWidth = sliderItems[0].offsetWidth + 40;
        currentIndex = 0;
        slider.style.transition = "none";
        slider.style.transform = `translateX(-${
          itemWidth * sliderItems.length
        }px)`;
        slider.offsetHeight;
      }, 50);
    }

    function setupEventListeners() {
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

      // 터치 슬라이드 이벤트
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
          if (isLeftSwipe) {
            slide("next");
            resetAutoSlide();
          } else if (isRightSwipe) {
            slide("prev");
            resetAutoSlide();
          }
        } else {
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
        if (currentIndex === itemsCount) {
          setTimeout(() => {
            slider.style.transition = "none";
            currentIndex = 0;
            slider.style.transform = `translateX(-${
              sliderItems.length * itemWidth
            }px)`;
            slider.offsetHeight;
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
        if (currentIndex === -1) {
          setTimeout(() => {
            slider.style.transition = "none";
            currentIndex = itemsCount - 1;
            slider.style.transform = `translateX(-${
              (sliderItems.length + currentIndex) * itemWidth
            }px)`;
            slider.offsetHeight;
            slider.style.pointerEvents = "auto";
          }, 600);
        } else {
          setTimeout(() => {
            slider.style.pointerEvents = "auto";
          }, 600);
        }
      }
    }

    function resetAutoSlide() {
      clearInterval(autoSlideIntervalId);
      autoSlideIntervalId = setInterval(() => {
        slide(defaultDirection);
      }, autoPlayInterval);
      if (sliderId === "categorySlider") {
        categorySliderInterval = autoSlideIntervalId;
      }
    }

    return autoSlideIntervalId;
  }
});
