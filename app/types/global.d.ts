interface KakaoShareOptions {
  objectType: string;
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
  buttons?: Array<{
    title: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  }>;
}

interface KakaoShare {
  sendDefault: (options: KakaoShareOptions) => Promise<void>;
}

interface Kakao {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: KakaoShare;
}

interface Window {
  Kakao: Kakao;
} 