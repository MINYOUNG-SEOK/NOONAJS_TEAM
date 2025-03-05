document.addEventListener("DOMContentLoaded", function () {
  // 메인 배너 이미지 순환
  const images = [
    "./images/banner1.png",
    "./images/banner2.png",
    "./images/banner3.png",
    "./images/banner4.png",
  ];
  let currentIndex = 0;
  const imageElement = document.getElementById("bannerImage");

  function changeImage() {
    currentIndex = (currentIndex + 1) % images.length;
    imageElement.classList.remove("fade-in");
    setTimeout(() => {
      imageElement.src = images[currentIndex];
      imageElement.classList.add("fade-in");
    }, 300);
  }

  setInterval(changeImage, 4000);

  // 베스트셀러 슬라이더 관련 요소
  const slider = document.getElementById("bestsellerSlider");
  const sliderItems = document.querySelectorAll(".bestseller-slider__item");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");

  // 메인 대표 책 정보 요소
  const featuredImage = document.getElementById("featuredImage");
  const featuredTitle = document.getElementById("featuredTitle");
  const featuredAuthor = document.getElementById("featuredAuthor");
  const featuredDescription = document.getElementById("featuredDescription");

  let currentSlideIndex = 0;
  const totalSlides = sliderItems.length;
  const visibleSlidesCount = Math.floor(
    (slider.parentElement.offsetWidth - 40) / (180 + 20)
  ); // 아이템 너비 + 간격
  const maxSlideIndex = totalSlides - visibleSlidesCount;
  let featuredBookIndex = totalSlides - 1; // 마지막 책으로 초기화 (슬라이더에 없는 책)

  // 전체 도서 데이터 (슬라이더 아이템에서 추출)
  const bookData = Array.from(sliderItems).map((item) => {
    return {
      image: item.querySelector("img").src,
      title: item.querySelector(".slider-book-title").textContent,
      author: item.querySelector(".slider-book-author").textContent,
      description: item.querySelector(".slider-book-description").textContent,
    };
  });

  // 추가 도서 데이터 (현재 슬라이더에 없는 책들)
  const additionalBooks = [
    {
      image: "./images/best6.jpg",
      title: "가을의 노래",
      author: "최서연",
      description:
        "계절의 변화와 함께 찾아오는 감성을 담은 시집. 가을의 정취를 섬세하게 표현한 작품들이 담겨있습니다.",
    },
    {
      image: "./images/best7.jpg",
      title: "미스터리 하우스",
      author: "강현우",
      description:
        "한 오래된 저택에서 발견되는 미스터리한 사건들. 숨겨진 비밀을 찾아가는 과정이 긴장감 있게 펼쳐집니다.",
    },
  ];

  // 모든 책 데이터를 합친다 (슬라이더 책 + 추가 책)
  const allBooks = [...bookData, ...additionalBooks];

  // 초기 설정 - 첫 번째 슬라이더 책과 다른 책으로 메인 책 설정
  setupInitialFeaturedBook();
  updatePageInfo();

  // 초기 메인 책 설정 (슬라이더와 겹치지 않는 책으로)
  function setupInitialFeaturedBook() {
    // 슬라이더에 표시된 책들의 인덱스
    const visibleBookIndices = Array.from(
      { length: visibleSlidesCount },
      (_, i) => (currentSlideIndex + i) % totalSlides
    );

    // 현재 슬라이더에 표시되지 않은 책 중에서 선택
    for (let i = 0; i < allBooks.length; i++) {
      if (!visibleBookIndices.includes(i % totalSlides)) {
        featuredBookIndex = i;
        break;
      }
    }

    // 선택된 책으로 메인 책 정보 업데이트
    const book = allBooks[featuredBookIndex];
    featuredImage.src = book.image;
    featuredTitle.textContent = book.title;
    featuredAuthor.textContent = book.author + " | 역자";
    featuredDescription.textContent = book.description;
  }

  // 슬라이더 아이템 클릭 이벤트
  sliderItems.forEach((item, index) => {
    item.addEventListener("click", function () {
      // 현재 메인 책을 슬라이더로 옮기고
      // 클릭한 책을 메인 책으로 설정
      swapFeaturedBook(index);
      resetAutoSlide();
    });
  });

  // 이전 버튼 클릭 이벤트
  prevBtn.addEventListener("click", function () {
    if (currentSlideIndex > 0) {
      // 이전 슬라이드로 이동하기 전에 현재 첫 번째 책을 메인으로 설정
      const firstVisibleIndex = currentSlideIndex;
      swapFeaturedBook(firstVisibleIndex - 1); // 이전 슬라이드의 마지막 책

      // 슬라이더 이동
      currentSlideIndex--;
      updateSlider();
      resetAutoSlide();
    }
  });

  // 다음 버튼 클릭 이벤트
  nextBtn.addEventListener("click", function () {
    if (currentSlideIndex < maxSlideIndex) {
      // 다음 슬라이드로 이동하기 전에 현재 첫 번째 책을 메인으로 설정
      const firstVisibleIndex = currentSlideIndex;
      swapFeaturedBook(firstVisibleIndex);

      // 슬라이더 이동
      currentSlideIndex++;
      updateSlider();
      resetAutoSlide();
    }
  });

  // 자동 슬라이드 기능
  let autoSlideInterval = setInterval(autoSlide, 5000);

  function autoSlide() {
    if (currentSlideIndex < maxSlideIndex) {
      // 현재 첫 번째 보이는 책을 메인 영역으로 이동
      const firstVisibleIndex = currentSlideIndex;
      swapFeaturedBook(firstVisibleIndex);

      // 슬라이더 이동
      currentSlideIndex++;
      updateSlider();
    } else {
      // 마지막에 도달하면 처음으로 돌아감
      currentSlideIndex = 0;
      updateSlider();

      // 이전 메인 책을 유지하고 새 슬라이드의 첫 번째 책은 표시하지 않음
      // 자연스러운 순환을 위함
    }
  }

  // 사용자가 슬라이더와 상호작용할 때 자동 슬라이드 리셋
  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(autoSlide, 5000);
  }

  // 슬라이더 위치 업데이트
  function updateSlider() {
    const itemWidth = sliderItems[0].offsetWidth + 40; // 아이템 너비 + 간격(gap)
    slider.style.transform = `translateX(-${currentSlideIndex * itemWidth}px)`;
    updatePageInfo();
  }

  // 페이지 정보 업데이트
  function updatePageInfo() {
    pageInfo.textContent = `${currentSlideIndex + 1} / ${Math.min(
      totalSlides,
      maxSlideIndex + 1
    )}`;
  }

  // 메인 책과 슬라이더 책 교체
  function swapFeaturedBook(sliderIndex) {
    // 현재 슬라이더에서 선택된 책의 인덱스
    const selectedBookIndex = sliderIndex % totalSlides;

    // 애니메이션 효과를 위한 클래스 처리
    featuredImage.classList.remove("fade-in");

    setTimeout(() => {
      // 슬라이더 책을 메인 영역으로 이동
      const selectedBook = bookData[selectedBookIndex];
      featuredImage.src = selectedBook.image;
      featuredTitle.textContent = selectedBook.title;
      featuredAuthor.textContent = selectedBook.author + " | 역자";
      featuredDescription.textContent = selectedBook.description;

      // 메인 책 인덱스 업데이트
      featuredBookIndex = selectedBookIndex;

      featuredImage.classList.add("fade-in");
    }, 300);
  }

  // 창 크기 변경 시 슬라이더 조정
  window.addEventListener("resize", function () {
    // 현재 표시 가능한 슬라이드 수 재계산
    const newVisibleSlidesCount = Math.floor(
      (slider.parentElement.offsetWidth - 40) / (180 + 40)
    );
    const newMaxSlideIndex = totalSlides - newVisibleSlidesCount;

    // 현재 인덱스가 새 최대 인덱스를 초과하면 조정
    if (currentSlideIndex > newMaxSlideIndex) {
      currentSlideIndex = newMaxSlideIndex;
    }

    updateSlider();
  });
});
