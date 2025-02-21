'use client';

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyDcSaOWKHJ9ZPR6v_bRH1Vu0JYRghxBcqI",
  authDomain: "astrocat-cffe1.firebaseapp.com",
  projectId: "astrocat-cffe1",
  storageBucket: "astrocat-cffe1.firebasestorage.app",
  messagingSenderId: "398053271259",
  appId: "1:398053271259:web:cf6cbb214d2898bdae8efe",
  measurementId: "G-MFVZ75HEZW"
};

let app: FirebaseApp | undefined;
let analytics: Analytics | undefined;

export function initFirebase() {
  if (typeof window !== 'undefined') {  // 'undefined'를 문자열로 수정
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      console.log("Firebase 초기화 완료");
      analytics = getAnalytics(app);
    }
  }

  return { app, analytics };
}