import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()
    
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('이미지 다운로드 실패')
    
    const blob = await response.blob()
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment'
      }
    })
  } catch (error) {
    console.error('이미지 다운로드 에러:', error)
    return NextResponse.json(
      { error: '이미지 다운로드에 실패했습니다.' },
      { status: 500 }
    )
  }
} 