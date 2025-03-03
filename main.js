document.addEventListener("DOMContentLoaded", function () {
  let basePath = "";

  const currentPath = window.location.pathname;

  if (currentPath.includes("/pages/")) {
    basePath = "../../";
  } else {
    basePath = "./";
  }

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

  // 헤더 로드
  fetch(`${basePath}components/header/header.html`)
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("afterbegin", data);
    })
    .catch((error) => {
      console.error("헤더를 로드하는 중 오류가 발생했습니다:", error);
    });

  // 푸터 로드
  fetch(`${basePath}components/footer/footer.html`)
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML("beforeend", data);
    })
    .catch((error) => {
      console.error("푸터를 로드하는 중 오류가 발생했습니다:", error);
    });
});
