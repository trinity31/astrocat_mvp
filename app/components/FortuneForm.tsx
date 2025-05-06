"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Language, translations } from "../translations";
import { logEvent } from "firebase/analytics";
import { createSajuParams, FortuneResult } from "../utils/fortune";
import { AnalyticsInstance } from "../types/firebase";

interface FortuneFormProps {
  language: Language;
  onFortuneResult: (result: FortuneResult) => void;
  analytics: AnalyticsInstance;
  name: string;
  setName: (name: string) => void;
  year: string;
  setYear: (year: string) => void;
  month: string;
  setMonth: (month: string) => void;
  day: string;
  setDay: (day: string) => void;
  birthTime: string;
  setBirthTime: (time: string) => void;
  gender: string;
  setGender: (gender: string) => void;
}

export default function FortuneForm({
  language,
  onFortuneResult,
  analytics,
  name,
  setName,
  year,
  setYear,
  month,
  setMonth,
  day,
  setDay,
  birthTime,
  setBirthTime,
  gender,
  setGender,
}: FortuneFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const t = translations[language];

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
  // minuteOptions 객체를 언어별로 정의
  const minuteOptions = {
    ko: [
      { value: "00", label: "0~29분" },
      { value: "30", label: "30~59분" },
    ],
    en: [
      { value: "00", label: "0-29 min" },
      { value: "30", label: "30-59 min" },
    ],
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    } else {
      setSelectedImage(null);
    }
  };

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

    if (analytics) {
      logEvent(analytics, "사주 보기", {
        birth_date: `${year}-${month}-${day}`,
        gender: gender,
      });
    }

    setIsLoading(true);
    setProgress(0);

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalId);
          return 100;
        }
        return prev + 3.33;
      });
    }, 1000);

    // Prepare form data
    const params = createSajuParams(
      name,
      gender,
      year,
      month,
      day,
      birthTime,
      "five_elements_divine",
      language
    );
    const formData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      const response = await fetch("/api/saju", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("API 호출 실패");
      }

      const result = await response.json();
      onFortuneResult({
        fortuneText: result.reading || t.errors.apiCallFailed,
        imageUrl: result.image_url || "/placeholder.svg",
        imageDescription: result.image_description || "",
      });
    } catch (error) {
      console.error("API 호출 에러:", error);
      onFortuneResult({
        fortuneText: t.errors.tryAgainLater,
        imageUrl: "/placeholder.svg",
        imageDescription: "",
      });
    } finally {
      clearInterval(intervalId);
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg mx-0 sm:mx-0">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="pt-4">
            <Label className="text-pink-300 text-lg">
              {t.name}
              <span className="text-pink-500 ml-1">*</span>
            </Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 px-3 py-2 bg-white/10 border border-pink-300/30 rounded-lg text-white placeholder:text-pink-200/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder={t.name}
              required
            />
          </div>
          <div>
            <Label className="text-pink-300 text-lg">
              {t.birthday}
              <span className="text-pink-500 ml-1">*</span>
            </Label>
            <div className="flex gap-2 mt-2">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-pink-300/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">{language === "ko" ? "년도" : "Year"}</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {language === "ko" ? `${y}년` : y}
                  </option>
                ))}
              </select>

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-pink-300/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">{language === "ko" ? "월" : "Month"}</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {language === "ko"
                      ? `${m}월`
                      : new Date(2000, parseInt(m.toString()) - 1).toLocaleString(
                          "en-US",
                          { month: "long" }
                        )}
                  </option>
                ))}
              </select>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-pink-300/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">{language === "ko" ? "일" : "Day"}</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {language === "ko" ? `${d}일` : d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-pink-300 text-lg">
              {t.birthTime}
              <span className="text-xs"> ( {t.birthTimeNote} )</span>
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
                    {language === "ko"
                      ? `${h.toString().padStart(2, "0")}시`
                      : `${h.toString().padStart(2, "0")}:00`}
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
                {minuteOptions[language].map(({ value, label }) => (
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

          <div>
            <Label className="text-pink-300 text-lg">이미지 업로드 (선택)</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-pink-200 mt-2"
            />
            {selectedImage && (
              <div className="mt-2 text-pink-400 text-sm">
                선택된 파일: {selectedImage.name}
              </div>
            )}
          </div>

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
        </form>
      </CardContent>
    </Card>
  );
}