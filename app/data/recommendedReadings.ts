export interface Reading {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  type: "nature" | "travel";
  originalPrice: number;
  price: number;
  isPromotion: boolean;
}

export const recommendedReadings: Record<"ko" | "en", Reading[]> = {
  ko: [
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
  ],
  en: [
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
  ],
} as const; 