import { NextResponse } from 'next/server'

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:8000'
  : 'https://saju.trinity-lab.co.kr'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${BASE_URL}/saju-reading`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('API 호출 실패')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API 호출 에러:', error)
    return NextResponse.json(
      {
        reading: "죄송합니다. 잠시 후 다시 시도해주세요.",
        image_url: "/placeholder.svg"
      },
      { status: 500 }
    )
  }
} 