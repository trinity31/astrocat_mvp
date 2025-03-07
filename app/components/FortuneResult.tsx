"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Language, translations } from "../translations";
import { FortuneResult, downloadImage, shareToKakao, TranslationObject } from "../utils/fortune";
import { useToast } from "@/hooks/use-toast";
import { AnalyticsInstance } from "../types/firebase";

interface FortuneResultProps {
  fortune: FortuneResult;
  language: Language;
  analytics: AnalyticsInstance;
  userData: {
    name: string;
    year: string;
    month: string;
    day: string;
    gender: string;
  };
}

export default function FortuneResultComponent({
  fortune,
  language,
  analytics,
  userData,
}: FortuneResultProps) {
  const { toast } = useToast();
  const t = translations[language];

  if (!fortune) return null;

  const handleDownload = async () => {
    const success = await downloadImage(
      fortune.imageUrl,
      analytics,
      userData,
      "fortune",
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

  const handleShare = async () => {
    const success = await shareToKakao(
      fortune.imageUrl,
      userData.name,
      fortune.imageDescription,
      analytics,
      userData,
      "fortune",
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
              <p className="text-pink-200">{fortune.imageDescription}</p>
            )}
            <div className="pt-4 border-t border-pink-300/30">
              <ReactMarkdown>{fortune.fortuneText}</ReactMarkdown>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 mt-4">
        <Button
          onClick={handleDownload}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
        >
          <Download className="h-5 w-5 mr-2" />
          {t.saveImage}
        </Button>
        {language === "ko" && (
          <Button
            onClick={handleShare}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
          >
            <Share2 className="h-5 w-5 mr-2" />
            {t.shareKakao}
          </Button>
        )}
      </div>
    </>
  );
}
