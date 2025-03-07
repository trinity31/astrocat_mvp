"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { initFirebase } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";
import { Language, translations } from "./translations";
import { FortuneResult } from "./utils/fortune";
import { AnalyticsInstance } from "./types/firebase";

// 컴포넌트 임포트
import InitialSetup from "./components/InitialSetup";
import FortuneForm from "./components/FortuneForm";
import FortuneResultComponent from "./components/FortuneResult";
import RecommendedReadings from "./components/RecommendedReadings";

export default function CuteMysticalFortuneApp() {
  const { analytics } = initFirebase() as { analytics: AnalyticsInstance };
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState("");
  const [fortune, setFortune] = useState<FortuneResult>(null);
  const [language, setLanguage] = useState<Language>("ko");
  const [isInitialSetupComplete, setIsInitialSetupComplete] = useState(false);

  // 현재 언어에 따른 텍스트 가져오기
  const t = translations[language];

  // 카카오 SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || "");
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

  // 초기 설정 완료 핸들러
  const handleInitialSetup = () => {
    setIsInitialSetupComplete(true);
  };

  // 정식 출시 알림 신청 핸들러
  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-0 sm:p-4">
      <div className="container mx-auto w-full sm:max-w-md">
        {!isInitialSetupComplete ? (
          <InitialSetup
            language={language}
            setLanguage={setLanguage}
            onComplete={handleInitialSetup}
            analytics={analytics}
          />
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

            {!fortune && (
              <FortuneForm
                language={language}
                onFortuneResult={setFortune}
                analytics={analytics}
                name={name}
                setName={setName}
                year={year}
                setYear={setYear}
                month={month}
                setMonth={setMonth}
                day={day}
                setDay={setDay}
                birthTime={birthTime}
                setBirthTime={setBirthTime}
                gender={gender}
                setGender={setGender}
              />
            )}

            {fortune && (
              <>
                <FortuneResultComponent
                  fortune={fortune}
                  language={language}
                  analytics={analytics}
                  userData={{ name, year, month, day, gender }}
                />

                {/* 추천 사주풀이 리스트 */}
                <RecommendedReadings
                  language={language}
                  analytics={analytics}
                  userData={{ name, year, month, day, gender, birthTime }}
                  fortune={fortune}
                />

                {/* 정식 출시 알림 신청 */}
                <div className="mt-8 p-4 bg-white/10 backdrop-blur-md rounded-lg">
                  <h2 className="text-xl font-bold text-pink-300 mb-2">
                    {t.notificationTitle}
                  </h2>
                  <p className="text-sm text-pink-200 mb-4">
                    {t.notificationDesc}
                  </p>
                  <form onSubmit={handleSubscribe} className="flex gap-2">
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
