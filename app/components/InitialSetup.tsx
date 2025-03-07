"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Language, translations } from "../translations";
import { logEvent } from "firebase/analytics";
import { AnalyticsInstance } from "../types/firebase";

interface InitialSetupProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onComplete: () => void;
  analytics: AnalyticsInstance;
}

export default function InitialSetup({
  language,
  setLanguage,
  onComplete,
  analytics,
}: InitialSetupProps) {
  const t = translations[language];

  const handleComplete = () => {
    onComplete();

    if (analytics) {
      logEvent(analytics, "초기_설정_완료", {
        language: language,
      });
    }
  };

  return (
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
            onClick={handleComplete}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6 mt-6"
          >
            {t.startButton}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
