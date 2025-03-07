import { Language, translations } from "../translations";
import { logEvent } from "firebase/analytics";
import { AnalyticsInstance } from "../types/firebase";

// API 요청 파라미터를 위한 인터페이스 정의
export interface SajuRequestParams {
  name: string;
  gender: string;
  datetime: string;
  reading_type: string;
  language: "ko" | "en";
  hour?: string;
  minute?: string;
  am_pm?: "am" | "pm";
}

export type FortuneImage = {
  imageUrl: string;
  type: string;
};

export type FortuneResult = {
  fortuneText: string;
  imageUrl: string;
  imageDescription: string;
} | null;

// 토스트 메시지 타입 정의
export interface ToastMessages {
  imageDownloaded: string;
  downloadFailed: string;
  shareFailed: string;
  kakaoTitle: string;
  kakaoButton: string;
}

// 번역 객체 타입 정의
export interface TranslationObject {
  toast: ToastMessages;
  [key: string]: unknown;
}

// 가격 표시를 위한 헬퍼 함수
export const formatPrice = (price: number, language: "ko" | "en") => {
  const { currency } = translations[language];
  const formattedNumber = price.toLocaleString();

  return currency.position === "before"
    ? `${currency.symbol}${formattedNumber}`
    : `${formattedNumber}${currency.symbol}`;
};

// 사주 API 호출 함수
export const getFortune = async (params: SajuRequestParams) => {
  const response = await fetch("/api/saju", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) throw new Error("API 호출 실패");
  return await response.json();
};

// 이미지 다운로드 함수
export const downloadImage = async (
  imageUrl: string,
  analytics: AnalyticsInstance,
  userData: { year: string; month: string; day: string; gender: string },
  type: string = "fortune",
  translationObj: TranslationObject
) => {
  if (!imageUrl) return;

  // Firebase Analytics 이벤트 추가
  if (analytics) {
    logEvent(analytics, "이미지 다운로드", {
      birth_date: `${userData.year}-${userData.month}-${userData.day}`,
      gender: userData.gender,
      type,
    });
  }

  try {
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobileDevice) {
      console.log(`다운로드 시작: ${translationObj.toast.imageDownloaded}`);
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { margin: 0; padding: 16px; font-family: sans-serif; }
                img { max-width: 100%; height: auto; }
                p { color: #666; text-align: center; margin-top: 16px; }
              </style>
            </head>
            <body>
              <img src="${imageUrl}" alt="운세 이미지" />
              <p>이미지를 길게 눌러서 저장할 수 있습니다</p>
              <p>Please long-press the image to save it.</p>
            </body>
          </html>
        `);
      }
      return true;
    }

    const fileName = imageUrl.split("/").pop() || `${type}-fortune.png`;
    const response = await fetch("/api/download-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) throw new Error("이미지 다운로드 실패");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

    return true;
  } catch (error) {
    console.error("다운로드 실패:", error);
    return false;
  }
};

// 카카오톡 공유 함수
export const shareToKakao = async (
  imageUrl: string,
  name: string,
  description: string,
  analytics: AnalyticsInstance,
  userData: { year: string; month: string; day: string; gender: string },
  type: string = "fortune",
  translationObj: TranslationObject
) => {
  if (!imageUrl) return;

  // Firebase Analytics 이벤트 추가
  if (analytics) {
    logEvent(analytics, "카카오톡 공유하기", {
      birth_date: `${userData.year}-${userData.month}-${userData.day}`,
      gender: userData.gender,
      type,
    });
  }

  try {
    if (!window.Kakao) {
      throw new Error("Kakao SDK not loaded");
    }

    await window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${name}${translationObj.toast.kakaoTitle}`,
        description: description.slice(0, 100) + "...",
        imageUrl: imageUrl,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: translationObj.toast.kakaoButton,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
    return true;
  } catch (error) {
    console.error("공유 실패:", error);
    return false;
  }
};

// 사주 파라미터 생성 함수
export const createSajuParams = (
  name: string,
  gender: string,
  year: string,
  month: string,
  day: string,
  birthTime: string,
  readingType: string,
  language: Language
): SajuRequestParams => {
  let params: SajuRequestParams = {
    name: name,
    gender: gender.toUpperCase(),
    datetime: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    reading_type: readingType,
    language: language,
  };

  if (birthTime) {
    const hour24 = parseInt(birthTime.split(":")[0]);
    const hour12 = hour24 % 12 || 12;
    const amPm = hour24 < 12 ? "am" : "pm";

    params = {
      ...params,
      hour: hour12.toString().padStart(2, "0"),
      minute: birthTime.split(":")[1] || "00",
      am_pm: amPm,
    };
  }

  return params;
}; 