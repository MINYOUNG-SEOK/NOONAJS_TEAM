document.addEventListener("DOMContentLoaded", async function () {
  let basePath = "";

  const currentPath = window.location.pathname;
  if (currentPath.includes("/pages/")) {
    basePath = "../../";
  } else {
    basePath = "./";
  }

  // ✅ 스타일 로드
  const commonStyle = document.createElement("link");
  commonStyle.rel = "stylesheet";
  commonStyle.href = `${basePath}style.css`;
  document.head.appendChild(commonStyle);

  const headerStyle = document.createElement("link");
  headerStyle.rel = "stylesheet";
  headerStyle.href = `${basePath}components/header/header.css`;
  document.head.appendChild(headerStyle);

  const footerStyle = document.createElement("link");
  footerStyle.rel = "stylesheet";
  footerStyle.href = `${basePath}components/footer/footer.css`;
  document.head.appendChild(footerStyle);

  // ✅ 헤더 로드 (중복 방지)
  if (!document.querySelector("header")) {
    try {
      const response = await fetch(`${basePath}components/header/header.html`);
      const data = await response.text();
      document.body.insertAdjacentHTML("afterbegin", data);
      console.log("헤더가 정상적으로 로드됨!");

      // ✅ 헤더가 로드된 후, header.js를 실행할 준비 완료
      document.dispatchEvent(new Event("headerLoaded"));
    } catch (error) {
      console.error("❌ 헤더를 로드하는 중 오류 발생:", error);
    }
  } else {
    console.warn("⚠️ 헤더가 이미 존재하므로 중복 로드를 방지합니다.");
    document.dispatchEvent(new Event("headerLoaded"));
  }

  // ✅ 푸터 로드
  try {
    const response = await fetch(`${basePath}components/footer/footer.html`);
    const data = await response.text();
    document.body.insertAdjacentHTML("beforeend", data);
    console.log("✅ 푸터가 정상적으로 로드됨!");
  } catch (error) {
    console.error("❌ 푸터를 로드하는 중 오류 발생:", error);
  }
});
