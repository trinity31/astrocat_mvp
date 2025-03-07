"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Language, translations } from "../translations";
import { ReadingType, recommendedReadings } from "../data/recommendedReadings";
import { useToast } from "@/hooks/use-toast";
import { logEvent } from "firebase/analytics";
import {
  FortuneResult,
  createSajuParams,
  downloadImage,
  formatPrice,
  shareToKakao,
  TranslationObject,
} from "../utils/fortune";
import { AnalyticsInstance } from "../types/firebase";

interface RecommendedReadingsProps {
  language: Language;
  analytics: AnalyticsInstance;
  userData: {
    name: string;
    year: string;
    month: string;
    day: string;
    gender: string;
    birthTime: string;
  };
  fortune: FortuneResult;
}

export default function RecommendedReadings({
  language,
  analytics,
  userData,
  fortune,
}: RecommendedReadingsProps) {
  const { toast } = useToast();
  const t = translations[language];
  const [natureReading, setNatureReading] = useState<FortuneResult>(null);
  const [animalReading, setAnimalReading] = useState<FortuneResult>(null);
  const [isNatureLoading, setIsNatureLoading] = useState(false);
  const [isAnimalLoading, setIsAnimalLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isNatureLoading || isAnimalLoading) {
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

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isNatureLoading, isAnimalLoading]);

  // 추천 카드 클릭 핸들러
  const handleRecommendedClick = async (
    reading: (typeof recommendedReadings)[Language][0]
  ) => {
    if (!fortune) return;

    // 이미 로딩 중이거나 결과가 있으면 리턴
    if (
      reading.type === ReadingType.NATURE &&
      (isNatureLoading || natureReading)
    )
      return;
    if (
      reading.type === ReadingType.ANIMAL &&
      (isAnimalLoading || animalReading)
    )
      return;

    // Firebase Analytics 이벤트 추가
    if (analytics) {
      logEvent(analytics, `추천 사주풀이 ${reading.type} 클릭`, {
        reading_type: reading.type,
        birth_date: `${userData.year}-${userData.month}-${userData.day}`,
        gender: userData.gender,
        price: reading.price,
        is_promotion: reading.isPromotion,
      });
    }

    try {
      if (reading.type === ReadingType.NATURE) {
        setIsNatureLoading(true);

        const params = createSajuParams(
          userData.name,
          userData.gender,
          userData.year,
          userData.month,
          userData.day,
          userData.birthTime,
          "five_elements_nature",
          language
        );

        const response = await fetch("/api/saju", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) throw new Error("API 호출 실패");
        const result = await response.json();

        setNatureReading({
          fortuneText: result.reading || t.errors.apiCallFailed,
          imageUrl: result.image_url || "/placeholder.svg",
          imageDescription: result.image_description || "",
        });
      } else if (reading.type === ReadingType.ANIMAL) {
        setIsAnimalLoading(true);

        const params = createSajuParams(
          userData.name,
          userData.gender,
          userData.year,
          userData.month,
          userData.day,
          userData.birthTime,
          "day_pillar",
          language
        );

        const response = await fetch("/api/saju", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) throw new Error("API 호출 실패");
        const result = await response.json();

        setAnimalReading({
          fortuneText: result.reading || t.errors.apiCallFailed,
          imageUrl: result.image_url || "/placeholder.svg",
          imageDescription: result.image_description || "",
        });
      } else if (reading.type === ReadingType.TRAVEL) {
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
      setIsAnimalLoading(false);
    }
  };

  const handleNatureDownload = async () => {
    if (!natureReading?.imageUrl) return;

    const success = await downloadImage(
      natureReading.imageUrl,
      analytics,
      userData,
      ReadingType.NATURE,
      t as unknown as TranslationObject
    );

    if (success) {
      toast({
        description: t.toast.imageDownloaded,
        duration: 2000,
      });
    } else {
      toast({
        variant: "destructive",
        description: t.toast.downloadFailed,
        duration: 3000,
      });
    }
  };

  const handleAnimalDownload = async () => {
    if (!animalReading?.imageUrl) return;

    const success = await downloadImage(
      animalReading.imageUrl,
      analytics,
      userData,
      ReadingType.ANIMAL,
      t as unknown as TranslationObject
    );

    if (success) {
      toast({
        description: t.toast.imageDownloaded,
        duration: 2000,
      });
    } else {
      toast({
        variant: "destructive",
        description: t.toast.downloadFailed,
        duration: 3000,
      });
    }
  };

  const handleNatureShare = async () => {
    if (!natureReading?.imageUrl) return;

    const success = await shareToKakao(
      natureReading.imageUrl,
      userData.name,
      natureReading.imageDescription,
      analytics,
      userData,
      ReadingType.NATURE,
      t as unknown as TranslationObject
    );

    if (!success) {
      toast({
        variant: "destructive",
        description: t.toast.shareFailed,
        duration: 2000,
      });
    }
  };

  const handleAnimalShare = async () => {
    if (!animalReading?.imageUrl) return;

    const success = await shareToKakao(
      animalReading.imageUrl,
      userData.name,
      animalReading.imageDescription,
      analytics,
      userData,
      ReadingType.ANIMAL,
      t as unknown as TranslationObject
    );

    if (!success) {
      toast({
        variant: "destructive",
        description: t.toast.shareFailed,
        duration: 2000,
      });
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-bold text-pink-300">{t.otherReadings}</h2>
      <div className="space-y-2">
        {recommendedReadings[language].map((reading) => (
          <div key={reading.id}>
            <Card
              className={`bg-white/10 backdrop-blur-md border-none shadow-lg overflow-hidden ${
                (reading.type === ReadingType.NATURE &&
                  (isNatureLoading || natureReading)) ||
                (reading.type === ReadingType.ANIMAL &&
                  (isAnimalLoading || animalReading))
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
                    <h3 className="font-bold text-white">{reading.title}</h3>
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
                            {formatPrice(reading.originalPrice, language)}
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
                            {formatPrice(reading.originalPrice, language)}
                          </span>
                          <span className="text-lg font-bold text-white">
                            {formatPrice(reading.price, language)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {reading.type === ReadingType.NATURE && isNatureLoading && (
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
                {reading.type === ReadingType.ANIMAL && isAnimalLoading && (
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
            {reading.type === ReadingType.NATURE && natureReading && (
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
                    onClick={handleNatureDownload}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {t.saveImage}
                  </Button>
                  {language === "ko" && (
                    <Button
                      onClick={handleNatureShare}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      {t.shareKakao}
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* 동물 이미지 결과 표시 */}
            {reading.type === ReadingType.ANIMAL && animalReading && (
              <>
                <Card className="mt-4 bg-white/10 backdrop-blur-md border-none shadow-lg overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="relative w-full aspect-square mb-4">
                      <Image
                        src={animalReading.imageUrl}
                        alt="동물 이미지"
                        fill
                        className="rounded-lg border-4 border-pink-300 object-cover"
                      />
                    </div>
                    <div className="prose prose-invert prose-pink max-w-none [&>*]:m-0 [&>*]:pl-0 space-y-6">
                      {animalReading.imageDescription && (
                        <p className="text-pink-200">
                          {animalReading.imageDescription}
                        </p>
                      )}
                      <div className="pt-4 border-t border-pink-300/30">
                        <ReactMarkdown>
                          {animalReading.fortuneText}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    onClick={handleAnimalDownload}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {t.saveImage}
                  </Button>
                  {language === "ko" && (
                    <Button
                      onClick={handleAnimalShare}
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
  );
}
