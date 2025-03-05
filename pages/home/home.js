document.addEventListener("DOMContentLoaded", function () {
  // 메인 배너 이미지 순환
  initBannerRotation();

  // 모든 슬라이더 초기화
  initSliders();

  // 배너 이미지 순환 기능
  function initBannerRotation() {
    const images = [
      "./images/banner1.png",
      "./images/banner2.png",
      "./images/banner3.png",
      "./images/banner4.png",
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

  // 모든 슬라이더 초기화
  function initSliders() {
    // 베스트셀러 슬라이더 (특별한 메인 책 디스플레이 포함)
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

    // 신작 도서 슬라이더 (무한 슬라이드, 왼쪽→오른쪽)
    initInfiniteSlider(
      "newReleaseSlider",
      "newPrevBtn",
      "newNextBtn",
      "newPageInfo",
      3000,
      "next" // 기본 방향: 왼쪽→오른쪽
    );

    // 카테고리별 베스트셀러 슬라이더 (무한 슬라이드, 오른쪽→왼쪽)
    initInfiniteSlider(
      "categorySlider",
      "catPrevBtn",
      "catNextBtn",
      "catPageInfo",
      3000,
      "prev", // 기본 방향: 오른쪽→왼쪽
      true // 버튼 방향 반전
    );

    // 카테고리 탭 기능 초기화
    initCategoryTabs();
  }

  // 카테고리 탭 기능
  function initCategoryTabs() {
    const categoryTabs = document.querySelectorAll(
      ".home-category-bestseller .home-category-item"
    );

    categoryTabs.forEach((tab) => {
      tab.addEventListener("click", function (e) {
        categoryTabs.forEach((t) => t.classList.remove("active"));
        this.classList.add("active");

        // 여기에 카테고리에 따른 슬라이더 내용 업데이트 코드를 추가할 수 있습니다
      });
    });
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
