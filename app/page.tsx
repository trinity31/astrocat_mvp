"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { initFirebase } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";
import { Toaster } from "@/components/ui/toaster";

// Mock 데이터 수정
const recommendedReadingsKr = [
  {
    id: 1,
    title: "내 사주를 닮은 자연",
    description:
      "당신의 사주를 아름다운 자연의 모습으로 표현한 이미지를 생성합니다.",
    imageUrl: "/images/nature-fortune.png",
    type: "nature",
    originalPrice: 9000,
    price: 0,
    isPromotion: true,
  },
  {
    id: 2,
    title: "나 사주에 맞는 여행지는?",
    description: "행운을 가져다 주는 여행지 이미지를 만들어 드립니다.",
    imageUrl: "/images/travel-fortune.png",
    type: "travel",
    originalPrice: 9000,
    price: 900,
    isPromotion: false,
  },
];

const recommendedReadingsEn = [
  {
    id: 1,
    title: "My Fortune in Nature",
    description: "Generate an image of your fortune in the form of nature.",
    imageUrl: "/images/nature-fortune.png",
    type: "nature",
    originalPrice: 10,
    price: 0,
    isPromotion: true,
  },
  {
    id: 2,
    title: "My Fortune in Travel",
    description:
      "Create an image of a travel destination that brings you good luck",
    imageUrl: "/images/travel-fortune.png",
    type: "travel",
    originalPrice: 10,
    price: 1,
    isPromotion: false,
  },
];

// 새로운 타입 정의 추가
type FortuneImage = {
  imageUrl: string;
  type: string;
};

// API 요청 파라미터를 위한 인터페이스 정의
interface SajuRequestParams {
  name: string;
  gender: string;
  datetime: string;
  reading_type: string;
  language: "ko" | "en";
  hour?: string;
  minute?: string;
  am_pm?: "am" | "pm";
}

export default function CuteMysticalFortuneApp() {
  const { analytics } = initFirebase();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState("");
  const [fortune, setFortune] = useState<{
    fortuneText: string;
    imageUrl: string;
    imageDescription: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [natureReading, setNatureReading] = useState<{
    fortuneText: string;
    imageUrl: string;
    imageDescription: string;
  } | null>(null);
  const [isNatureLoading, setIsNatureLoading] = useState(false);
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [isInitialSetupComplete, setIsInitialSetupComplete] = useState(false);

  // 다국어 텍스트 객체 추가
  const translations = {
    ko: {
      welcome: "안녕! 나는 사주 보는 우주고양이야! 언어를 선택해 달라냥.",
      languageSelect: "언어 선택",
      startButton: "시작하기 ✨",
      mainWelcome:
        "안녕! 나는 사주보는 우주고양이! 너의 사주팔자 모습을 그림으로 그려줄게. 생년월일과 태어난 시간을 양력으로 입력해 달라냥~",
      loading: "잠시만 기다려 달라냥~ 🐱",
      viewFortune: "🔮 내 사주 이미지 보기",
      saveImage: "이미지 저장",
      shareKakao: "카카오톡으로 공유",
      year: "년도",
      month: "월",
      day: "일",
      hour: "시",
      minute: "분",
      birthTime: "태어난 시간",
      birthTimeNote: "(모르면 비워두세요)",
      gender: "성별",
      male: "남성",
      female: "여성",
      koreanText: "한국어",
      englishText: "English",
      otherReadings: "다른 사주풀이 보기",
      freeExperience: "무료 체험",
      discount: "90%",
      won: "원",
      comingSoon: "준비 중인 기능입니다 😺",
      notificationTitle: "정식출시 알림 신청",
      notificationDesc:
        "더 다양한 사주풀이가 준비되어 있어요! 정식출시 소식을 가장 먼저 받아보세요.",
      emailPlaceholder: "이메일 주소를 입력해주세요",
      subscribe: "신청하기",
      subscribeSuccess: "알림 신청이 완료되었습니다!",
      subscribeError: "알림 신청에 실패했습니다. 다시 시도해주세요.",
      currency: {
        symbol: "원",
        position: "after",
      },
      errors: {
        nameRequired: "이름을 입력해주세요.",
        genderRequired: "성별을 선택해주세요.",
        apiCallFailed: "운세를 불러오는데 실패했습니다.",
        tryAgainLater: "죄송합니다. 잠시 후 다시 시도해주세요.",
      },
      toast: {
        imageDownloaded: "이미지가 다운로드되었습니다.",
        downloadFailed:
          "이미지 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.",
        shareFailed: "공유하기에 실패했습니다.",
        kakaoTitle: "님의 사주 이미지",
        kakaoButton: "내 사주 이미지 보기",
      },
    },
    en: {
      welcome: "Hi! I'm the Fortune-telling Space Cat! Choose your language~",
      languageSelect: "Language",
      startButton: "Let's Start ✨",
      mainWelcome:
        "Hi! I'm the Fortune-telling Space Cat! I'll draw your fortune in pictures. Please enter your birth date and time in solar calendar~",
      loading: "Please wait a moment~ 🐱",
      viewFortune: "🔮 View My Fortune Image",
      saveImage: "Save Image",
      shareKakao: "Share via KakaoTalk",
      year: "Year",
      month: "Month",
      day: "Day",
      hour: "Hour",
      minute: "Minute",
      birthTime: "Birth Time",
      birthTimeNote: "(Leave empty if unknown)",
      gender: "Gender",
      male: "Male",
      female: "Female",
      koreanText: "한국어",
      englishText: "English",
      otherReadings: "View Other Fortune Readings",
      freeExperience: "Free Trial",
      discount: "90% OFF",
      won: "USD",
      comingSoon: "Coming Soon 😺",
      notificationTitle: "Get Launch Notification",
      notificationDesc:
        "More fortune readings are coming! Be the first to know when we officially launch.",
      emailPlaceholder: "Enter your email address",
      subscribe: "Subscribe",
      subscribeSuccess: "Successfully subscribed!",
      subscribeError: "Failed to subscribe. Please try again.",
      currency: {
        symbol: "$",
        position: "before",
      },
      errors: {
        nameRequired: "Please enter your name.",
        genderRequired: "Please select your gender.",
        apiCallFailed: "Failed to load your fortune.",
        tryAgainLater: "Sorry, please try again later.",
      },
      toast: {
        imageDownloaded: "Image has been downloaded.",
        downloadFailed: "Failed to download image. Please try again later.",
        shareFailed: "Failed to share.",
        kakaoTitle: "'s Fortune Image",
        kakaoButton: "View My Fortune Image",
      },
    },
  };

  // 현재 언어에 따른 텍스트 가져오기
  const t = translations[language];

  // 가격 표시를 위한 헬퍼 함수 추가
  const formatPrice = (price: number, language: "ko" | "en") => {
    const { currency } = translations[language];
    const formattedNumber = price.toLocaleString();

    return currency.position === "before"
      ? `${currency.symbol}${formattedNumber}`
      : `${formattedNumber}${currency.symbol}`;
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isLoading || isNatureLoading) {
      setProgress(0);
      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalId);
            return 100;
          }
          return prev + 3.33;
        });
      }, 1000);
    } else {
      setProgress(0);
    }

    initFirebase();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading, isNatureLoading]);

  // 카카오 SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY);
      //console.log("Kakao init:", window.Kakao.isInitialized());
    }
  }, []);

  // 페이지 로드 이벤트 추가
  useEffect(() => {
    if (analytics) {
      // 접속 환경 정보 수집
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isKakao = /KAKAOTALK/i.test(navigator.userAgent);

      logEvent(analytics, "페이지 진입", {
        platform: isMobile ? "mobile" : "desktop",
        browser: isKakao ? "kakaotalk" : navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
      });
    }
  }, [analytics]);

  // 브라우저 언어 감지를 위한 useEffect 추가
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    setLanguage(browserLang.startsWith("ko") ? "ko" : "en");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert(t.errors.nameRequired);
      return;
    }

    if (!gender) {
      alert(t.errors.genderRequired);
      return;
    }

    // Firebase Analytics 이벤트 추가
    if (analytics) {
      logEvent(analytics, "사주 보기", {
        birth_date: `${year}-${month}-${day}`,
        gender: gender,
      });
    }

    setIsLoading(true);

    let params: SajuRequestParams = {
      name: name,
      gender: gender.toUpperCase(),
      datetime: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
      reading_type: "five_elements_divine",
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

    console.log("서버로 전송되는 파라미터:", params);

    try {
      const response = await fetch("/api/saju", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("API 호출 실패");
      }

      const result = await response.json();
      setFortune({
        fortuneText: result.reading || t.errors.apiCallFailed,
        imageUrl: result.image_url || "/placeholder.svg",
        imageDescription: result.image_description || "",
      });
    } catch (error) {
      console.error("API 호출 에러:", error);
      setFortune({
        fortuneText: t.errors.tryAgainLater,
        imageUrl: "/placeholder.svg",
        imageDescription: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 함수 시그니처 변경
  const handleDownload = async (reading: FortuneImage) => {
    if (!reading.imageUrl) return;

    // Firebase Analytics 이벤트 추가
    if (analytics) {
      logEvent(analytics, "이미지 다운로드", {
        birth_date: `${year}-${month}-${day}`,
        gender: gender,
      });
    }

    try {
      // 모바일 환경 체크
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobileDevice) {
        // 모바일에서는 새 창에서 이미지 열기
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
                <img src="${reading.imageUrl}" alt="운세 이미지" />
                <p>이미지를 길게 눌러서 저장할 수 있습니다</p>
                <p>Please long-press the image to save it.</p>
              </body>
            </html>
          `);
        }
        return;
      }

      // PC에서는 기존 방식대로 다운로드
      const fileName = reading.imageUrl.split("/").pop() || "saju-fortune.png";

      const response = await fetch("/api/download-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: reading.imageUrl }),
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

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      toast({
        description: t.toast.imageDownloaded,
        duration: 2000,
      });
    } catch (error) {
      console.error("다운로드 실패:", error);
      toast({
        variant: "destructive",
        description: t.toast.downloadFailed,
        duration: 3000,
      });
    }
  };

  const handleShare = async (reading: FortuneImage) => {
    if (!reading.imageUrl) return;

    // Firebase Analytics 이벤트 추가
    if (analytics) {
      logEvent(analytics, "카카오톡 공유하기", {
        birth_date: `${year}-${month}-${day}`,
        gender: gender,
      });
    }

    try {
      if (!window.Kakao) {
        throw new Error("Kakao SDK not loaded");
      }

      await window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: `${name}${t.toast.kakaoTitle}`,
          description: fortune?.imageDescription.slice(0, 100) + "...",
          imageUrl: fortune?.imageUrl,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: t.toast.kakaoButton,
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } catch (error) {
      console.error("공유 실패:", error);
      toast({
        variant: "destructive",
        description: t.toast.shareFailed,
        duration: 2000,
      });
    }
  };

  // 초기 설정 완료 핸들러
  const handleInitialSetup = () => {
    setIsInitialSetupComplete(true);

    if (analytics) {
      logEvent(analytics, "초기_설정_완료", {
        language: language,
      });
    }
  };

  // 현재 연도 계산
  const currentYear = new Date().getFullYear();
  // 연도 옵션 생성 (1900년부터 현재까지)
  const years = Array.from(
    { length: currentYear - 1899 },
    (_, i) => currentYear - i
  );
  // 월 옵션 생성
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  // 일 옵션 생성
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  // 시간 옵션 생성 (00시 ~ 23시)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // 분 옵션 생성 (30분 단위)
  const minuteOptions = [
    { value: "00", label: "0~29분" },
    { value: "30", label: "30~59분" },
  ];

  const getFortune = async (readingType: string) => {
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

  // 추천 카드 클릭 핸들러 수정
  const handleRecommendedClick = async (
    reading: (typeof recommendedReadingsKr | typeof recommendedReadingsEn)[0]
  ) => {
    if (!fortune) return;

    // 이미 로딩 중이거나 결과가 있으면 리턴
    if (reading.type === "nature" && (isNatureLoading || natureReading)) return;

    // Firebase Analytics 이벤트 추가
    if (analytics) {
      logEvent(analytics, `추천 사주풀이 ${reading.type} 클릭`, {
        reading_type: reading.type,
        birth_date: `${year}-${month}-${day}`,
        gender: gender,
        price: reading.price,
        is_promotion: reading.isPromotion,
      });
    }

    try {
      if (reading.type === "nature") {
        setIsNatureLoading(true);
        const result = await getFortune("five_elements_nature");
        setNatureReading({
          fortuneText: result.reading,
          imageUrl: result.image_url,
          imageDescription: result.image_description,
        });
      } else if (reading.type === "travel") {
        toast({
          description: t.comingSoon,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("추천 사주풀이 에러:", error);
      toast({
        variant: "destructive",
        description: t.errors.apiCallFailed,
        duration: 2000,
      });
    } finally {
      setIsNatureLoading(false);
    }
  };

  const handleNatureDownload = async (reading: typeof natureReading) => {
    if (!reading?.imageUrl) return;

    // Firebase Analytics 이벤트 추가
    if (analytics) {
      logEvent(analytics, "이미지 다운로드", {
        birth_date: `${year}-${month}-${day}`,
        gender: gender,
        type: "nature",
      });
    }

    try {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobileDevice) {
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
                <img src="${reading.imageUrl}" alt="자연 이미지" />
                <p>이미지를 길게 눌러서 저장할 수 있습니다</p>
                <p>Please long-press the image to save it.</p>
              </body>
            </html>
          `);
        }
        return;
      }

      const fileName =
        reading.imageUrl.split("/").pop() || "nature-fortune.png";
      const response = await fetch("/api/download-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: reading.imageUrl }),
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

      toast({
        description: t.toast.imageDownloaded,
        duration: 2000,
      });
    } catch (error) {
      console.error("다운로드 실패:", error);
      toast({
        variant: "destructive",
        description: t.toast.downloadFailed,
        duration: 3000,
      });
    }
  };

  const handleNatureShare = async (reading: typeof natureReading) => {
    if (!reading?.imageUrl) return;

    // Firebase Analytics 이벤트 추가
    if (analytics) {
      logEvent(analytics, "카카오톡 공유하기", {
        birth_date: `${year}-${month}-${day}`,
        gender: gender,
        type: "nature",
      });
    }

    try {
      if (!window.Kakao) {
        throw new Error("Kakao SDK not loaded");
      }

      await window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: `${name}님의 사주 자연 이미지`,
          description: reading.imageDescription.slice(0, 100) + "...",
          imageUrl: reading.imageUrl,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: "내 사주 이미지 보기",
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });
    } catch (error) {
      console.error("공유 실패:", error);
      toast({
        variant: "destructive",
        description: t.toast.shareFailed,
        duration: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-0 sm:p-4">
      <div className="container mx-auto w-full sm:max-w-md">
        {!isInitialSetupComplete ? (
          <div className="text-center">
            <div className="relative w-[200px] h-[200px] mx-auto">
              <Image
                src="/images/cat.gif"
                alt="말하는 고양이"
                width={200}
                height={200}
                className="rounded-full border-4 border-pink-300"
              />
            </div>
            <p className="mt-4 text-xl font-bold text-pink-500">{t.welcome}</p>

            <Card className="mt-8 bg-white/10 backdrop-blur-md border-none shadow-lg mx-0 sm:mx-0">
              <CardContent className="p-6 space-y-6">
                {/* 언어 선택 */}
                <div>
                  <Label className="text-pink-300 text-lg">
                    {t.languageSelect}
                    <span className="text-pink-500 ml-1">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => setLanguage("ko")}
                      className={`
                        py-2 px-3 rounded-lg border-2 transition-all
                        ${
                          language === "ko"
                            ? "border-pink-500 bg-pink-500/20 text-white"
                            : "border-pink-300/50 text-pink-200 hover:border-pink-300 hover:bg-white/5"
                        }
                      `}
                    >
                      {t.koreanText}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage("en")}
                      className={`
                        py-2 px-3 rounded-lg border-2 transition-all
                        ${
                          language === "en"
                            ? "border-pink-500 bg-pink-500/20 text-white"
                            : "border-pink-300/50 text-pink-200 hover:border-pink-300 hover:bg-white/5"
                        }
                      `}
                    >
                      {t.englishText}
                    </button>
                  </div>
                </div>

                {/* 시작하기 버튼 */}
                <Button
                  onClick={handleInitialSetup}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6 mt-6"
                >
                  {t.startButton}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="relative w-[200px] h-[200px] mx-auto">
                <Image
                  src="/images/cat.gif"
                  alt="말하는 고양이"
                  width={200}
                  height={200}
                  className="rounded-full border-4 border-pink-300"
                />
              </div>
              <p className="mt-4 text-xl font-bold text-pink-500">
                {t.mainWelcome}
              </p>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg mx-0 sm:mx-0">
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="pt-4">
                    <Label className="text-pink-300 text-lg">
                      {t.viewFortune}
                      <span className="text-pink-500 ml-1">*</span>
                    </Label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full mt-2 px-3 py-2 bg-white/10 border border-pink-300/30 rounded-lg text-white placeholder:text-pink-200/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder={t.viewFortune}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-pink-300 text-lg">
                      {t.year}
                      <span className="text-pink-500 ml-1">*</span>
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <select
                        value={year ?? 1995} // 처음 접속 시, year가 없으면 1995를 기본값으로
                        onChange={(e) => setYear(e.target.value)}
                        required
                        className="flex-1 bg-white/20 border-pink-300 text-pink-200 rounded-md h-10 px-3"
                      >
                        <option value="">{t.year}</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}년
                          </option>
                        ))}
                      </select>

                      <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                        className="flex-1 bg-white/20 border-pink-300 text-pink-200 rounded-md h-10 px-3"
                      >
                        <option value="">{t.month}</option>
                        {months.map((m) => (
                          <option key={m} value={m.toString().padStart(2, "0")}>
                            {m}월
                          </option>
                        ))}
                      </select>
                      <select
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        required
                        className="flex-1 bg-white/20 border-pink-300 text-pink-200 rounded-md h-10 px-3"
                      >
                        <option value="">{t.day}</option>
                        {days.map((d) => (
                          <option key={d} value={d.toString().padStart(2, "0")}>
                            {d}일
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-pink-300 text-lg">
                      {t.birthTime}
                      <span className="text-xs">({t.birthTimeNote})</span>
                    </Label>

                    <div className="flex gap-2 mt-2">
                      <select
                        value={birthTime.split(":")[0] || ""}
                        onChange={(e) => {
                          const hour = e.target.value.padStart(2, "0");
                          const minute = birthTime.split(":")[1] || "00";
                          setBirthTime(`${hour}:${minute}`);
                        }}
                        className="flex-1 bg-white/20 border-pink-300 text-pink-200 rounded-md h-10 px-3"
                      >
                        <option value="">{t.hour}</option>
                        {hours.map((h) => (
                          <option key={h} value={h.toString().padStart(2, "0")}>
                            {h.toString().padStart(2, "0")}시
                          </option>
                        ))}
                      </select>
                      <select
                        value={birthTime.split(":")[1] || ""}
                        onChange={(e) => {
                          const hour = birthTime.split(":")[0] || "00";
                          const minute = e.target.value;
                          setBirthTime(`${hour}:${minute}`);
                        }}
                        className="flex-1 bg-white/20 border-pink-300 text-pink-200 rounded-md h-10 px-3"
                      >
                        <option value="">{t.minute}</option>
                        {minuteOptions.map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-pink-300 text-lg">
                      {t.gender}
                      <span className="text-pink-500 ml-1">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className={`
                          py-2 px-3 rounded-lg border-2 transition-all
                          ${
                            gender === "male"
                              ? "border-pink-500 bg-pink-500/20 text-white"
                              : "border-pink-300/50 text-pink-200 hover:border-pink-300 hover:bg-white/5"
                          }
                        `}
                      >
                        {t.male}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className={`
                          py-2 px-3 rounded-lg border-2 transition-all
                          ${
                            gender === "female"
                              ? "border-pink-500 bg-pink-500/20 text-white"
                              : "border-pink-300/50 text-pink-200 hover:border-pink-300 hover:bg-white/5"
                          }
                        `}
                      >
                        {t.female}
                      </button>
                    </div>
                  </div>

                  {/* 운세 보기 버튼과 로딩바는 fortune이 없을 때만 표시 */}
                  {!fortune && (
                    <>
                      {!isLoading ? (
                        <Button
                          type="submit"
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
                        >
                          {t.viewFortune}
                        </Button>
                      ) : (
                        <div>
                          <p className="mb-4 text-lg font-medium text-pink-200 text-center">
                            {t.loading}
                          </p>
                          <div className="w-full bg-white/20 rounded-full h-4">
                            <div
                              className="bg-pink-500 h-4 rounded-full transition-all duration-3000"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </form>
              </CardContent>
            </Card>

            {fortune && (
              <>
                <Card className="mt-8 bg-white/10 backdrop-blur-md border-none shadow-lg overflow-hidden mx-0 sm:mx-0">
                  <CardContent className="pt-6">
                    <div className="relative w-full aspect-square mb-4">
                      <Image
                        src={fortune.imageUrl || "/placeholder.svg"}
                        alt={t.viewFortune}
                        fill
                        className="rounded-lg border-4 border-pink-300 object-cover"
                      />
                    </div>
                    <div className="prose prose-invert prose-pink max-w-none [&>*]:m-0 [&>*]:pl-0 space-y-6">
                      {fortune.imageDescription && (
                        <p className="text-pink-200">
                          {fortune.imageDescription}
                        </p>
                      )}
                      <div className="pt-4 border-t border-pink-300/30">
                        <ReactMarkdown>{fortune.fortuneText}</ReactMarkdown>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 추가된 다운로드/공유 버튼 */}
                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    onClick={() =>
                      handleDownload({
                        imageUrl: fortune.imageUrl,
                        type: "fortune",
                      })
                    }
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {t.saveImage}
                  </Button>
                  {/* 카카오톡 공유 버튼은 한국어일 때만 표시 */}
                  {language === "ko" && (
                    <Button
                      onClick={() =>
                        handleShare({
                          imageUrl: fortune.imageUrl,
                          type: "fortune",
                        })
                      }
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      {t.shareKakao}
                    </Button>
                  )}
                </div>

                {/* 추천 사주풀이 리스트 */}
                <div className="mt-8 space-y-4">
                  <h2 className="text-xl font-bold text-pink-300">
                    {t.otherReadings}
                  </h2>
                  <div className="space-y-2">
                    {(language === "ko"
                      ? recommendedReadingsKr
                      : recommendedReadingsEn
                    ).map((reading) => (
                      <div key={reading.id}>
                        <Card
                          className={`bg-white/10 backdrop-blur-md border-none shadow-lg overflow-hidden ${
                            reading.type === "nature" &&
                            (isNatureLoading || natureReading)
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-white/20"
                          } transition-all`}
                          onClick={() => handleRecommendedClick(reading)}
                        >
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="relative w-24 h-24 flex-shrink-0">
                                <Image
                                  src={reading.imageUrl}
                                  alt={reading.title}
                                  fill
                                  className="rounded-lg object-cover"
                                />
                              </div>

                              <div className="flex-1">
                                <h3 className="font-bold text-white">
                                  {reading.title}
                                </h3>
                                <p className="text-sm text-pink-200 mt-1">
                                  {reading.description}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  {reading.isPromotion ? (
                                    <>
                                      <span className="text-xs px-2 py-0.5 bg-pink-500 text-white rounded-full">
                                        {t.freeExperience}
                                      </span>
                                      <span className="text-sm text-gray-400 line-through">
                                        {formatPrice(
                                          reading.originalPrice,
                                          language
                                        )}
                                      </span>
                                      <span className="text-lg font-bold text-white">
                                        {formatPrice(0, language)}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-xs px-2 py-0.5 bg-pink-500 text-white rounded-full">
                                        {t.discount}
                                      </span>
                                      <span className="text-sm text-gray-400 line-through">
                                        {formatPrice(
                                          reading.originalPrice,
                                          language
                                        )}
                                      </span>
                                      <span className="text-lg font-bold text-white">
                                        {formatPrice(reading.price, language)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            {reading.type === "nature" && isNatureLoading && (
                              <div className="mt-4">
                                <p className="mb-4 text-lg font-medium text-pink-200 text-center">
                                  {t.loading}
                                </p>
                                <div className="w-full bg-white/20 rounded-full h-4">
                                  <div
                                    className="bg-pink-500 h-4 rounded-full transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* 자연 이미지 결과 표시 */}
                        {reading.type === "nature" && natureReading && (
                          <>
                            <Card className="mt-4 bg-white/10 backdrop-blur-md border-none shadow-lg overflow-hidden">
                              <CardContent className="pt-6">
                                <div className="relative w-full aspect-square mb-4">
                                  <Image
                                    src={natureReading.imageUrl}
                                    alt="자연 이미지"
                                    fill
                                    className="rounded-lg border-4 border-pink-300 object-cover"
                                  />
                                </div>
                                <div className="prose prose-invert prose-pink max-w-none [&>*]:m-0 [&>*]:pl-0 space-y-6">
                                  {natureReading.imageDescription && (
                                    <p className="text-pink-200">
                                      {natureReading.imageDescription}
                                    </p>
                                  )}
                                  <div className="pt-4 border-t border-pink-300/30">
                                    <ReactMarkdown>
                                      {natureReading.fortuneText}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <div className="flex flex-col gap-2 mt-4">
                              <Button
                                onClick={() =>
                                  handleNatureDownload(natureReading)
                                }
                                className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
                              >
                                <Download className="h-5 w-5 mr-2" />
                                {t.saveImage}
                              </Button>
                              {language === "ko" && (
                                <Button
                                  onClick={() =>
                                    handleNatureShare(natureReading)
                                  }
                                  className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
                                >
                                  <Share2 className="h-5 w-5 mr-2" />
                                  {t.shareKakao}
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 추천 사주풀이 리스트 아래에 추가 */}
                <div className="mt-8 p-4 bg-white/10 backdrop-blur-md rounded-lg">
                  <h2 className="text-xl font-bold text-pink-300 mb-2">
                    {t.notificationTitle}
                  </h2>
                  <p className="text-sm text-pink-200 mb-4">
                    {t.notificationDesc}
                  </p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const email = (e.target as HTMLFormElement).email.value;

                      if (analytics) {
                        logEvent(analytics, "정식출시_알림_신청", {
                          email: email,
                        });
                      }

                      try {
                        const response = await fetch("/api/subscribe", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ email }),
                        });

                        if (!response.ok) throw new Error();

                        toast({
                          description: t.subscribeSuccess,
                          duration: 2000,
                        });

                        // 폼 초기화
                        (e.target as HTMLFormElement).reset();
                      } catch (error) {
                        console.error("정식출시 알림 신청 에러:", error);
                        toast({
                          variant: "destructive",
                          description: t.subscribeError,
                          duration: 2000,
                        });
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="email"
                      name="email"
                      placeholder={t.emailPlaceholder}
                      required
                      className="flex-1 px-3 py-2 bg-white/10 border border-pink-300/30 rounded-lg text-white placeholder:text-pink-200/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <Button
                      type="submit"
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      {t.subscribe}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Toaster 컴포넌트 추가 */}
      <Toaster />
    </div>
  );
}
