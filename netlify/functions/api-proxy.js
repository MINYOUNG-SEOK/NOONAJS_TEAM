// netlify/functions/api-proxy.js
exports.handler = async function (event, context) {
  try {
    // Netlify 환경 변수에서 API 키 가져오기
    const apiKey = process.env.API_KEY;
    console.log("Netlify 환경 변수 (로컬):", apiKey);

    if (!apiKey) {
      throw new Error("API_KEY가 정의되지 않았습니다. .env 파일을 확인하세요.");
    }

    // 클라이언트에서 전달된 파라미터
    const params = event.queryStringParameters || {};

    // API 타입 가져오기 (ItemList, ItemLookUp, etc)
    const apiType = params.apiType;

    // 기본 URL
    let url = new URL(
      `http://www.aladin.co.kr/ttb/api/${apiType}.aspx?ttbkey=${apiKey}&output=js&Version=20131101`
    );

    // apiType 제외한 나머지 파라미터들 url에 추가
    for (let key in params) {
      if (key !== "apiType") {
        url.searchParams.set(key, params[key]);
      }
    }

    console.log("요청 url: ", url); // 디버깅용

    // API 호출
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API responded with status : , ${response.status}`);
    }

    const data = await response.json();

    // 결과 반환
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.log("error : ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch data",
        message: error.message,
      }),
    };
  }
};
