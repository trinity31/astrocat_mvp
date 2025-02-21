import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 슬랙 웹훅으로 메시지 전송
    await fetch("YOUR_SLACK_WEBHOOK_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: `🔔 카카오톡 공유 발생!\n공유된 URL: ${body.referrer || "알 수 없음"}`,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kakao callback error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 