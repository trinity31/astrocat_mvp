"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { ClockIcon, SunIcon, UserIcon } from "lucide-react"
import ReactMarkdown from 'react-markdown'

export default function CuteMysticalFortuneApp() {
  const [year, setYear] = useState("")
  const [month, setMonth] = useState("")
  const [day, setDay] = useState("")
  const [birthTime, setBirthTime] = useState("")
  const [gender, setGender] = useState("")
  const [fortune, setFortune] = useState<{
    fortuneText: string;
    imageUrl: string;
    imageDescription: string;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isLoading) {
      setProgress(0)
      intervalId = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(intervalId)
            return 100
          }
          return prev + 3.33  // 30초 동안 100%까지 도달 (100/30 ≈ 3.33)
        })
      }, 1000)  // 1초마다 업데이트
    } else {
      setProgress(0)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gender) {
      alert('성별을 선택해주세요.')
      return
    }

    setIsLoading(true)
    
    // 시간이 12시간제로 변환되어야 하므로, am/pm 결정
    const hour24 = parseInt(birthTime.split(':')[0])
    const hour12 = hour24 % 12 || 12
    const amPm = hour24 < 12 ? "am" : "pm"
    
    const params = {
      gender: gender.toUpperCase(),
      datetime: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      hour: hour12.toString().padStart(2, '0'),
      minute: birthTime.split(':')[1] || '00',
      am_pm: amPm,
      reading_type: "five_elements_divine"
    }
    
    console.log('서버로 전송되는 파라미터:', params)

    try {
      const response = await fetch("/api/saju", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error('API 호출 실패')
      }

      const result = await response.json()
      setFortune({
        fortuneText: result.reading || "운세를 불러오는데 실패했습니다.",
        imageUrl: result.image_url || "/placeholder.svg",
        imageDescription: result.image_description || ""
      })
    } catch (error) {
      console.error('API 호출 에러:', error)
      setFortune({
        fortuneText: "죄송합니다. 잠시 후 다시 시도해주세요.",
        imageUrl: "/placeholder.svg",
        imageDescription: ""
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 현재 연도 계산
  const currentYear = new Date().getFullYear()
  // 연도 옵션 생성 (1900년부터 현재까지)
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i)
  // 월 옵션 생성
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  // 일 옵션 생성
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  // 시간 옵션 생성 (00시 ~ 23시)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  // 분 옵션 생성 (30분 단위)
  const minuteOptions = [
    { value: "00", label: "0~29분" },
    { value: "30", label: "30~59분" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-2 sm:p-8">
      <div className="container mx-auto w-full sm:max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-[200px] h-[200px] mx-auto">
            <Image
              src="/images/cat.gif"
              alt="말하는 고양이"
              width={200}
              height={200}
              className="rounded-full border-4 border-pink-300"
            />
          </div>
          <p className="mt-4 text-xl font-bold text-pink-500">
            안녕! 나는 사주보는 우주고양이. 너의 사주팔자를 그림으로 그려줄게. 생년월일과 태어난 시간을 양력으로 입력해 달라냥~
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg mx-[-8px] sm:mx-0">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="pt-4">
                <Label className="text-pink-300">
                  <SunIcon className="inline-block mr-2" />
                  생년월일
                </Label>
                <div className="flex gap-2 mt-2">
                  <select
                    value={year ?? 1995}  // 처음 접속 시, year가 없으면 1995를 기본값으로
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="flex-1 bg-white/20 border-pink-300 text-pink-200 rounded-md h-10 px-3"
                  >
                    <option value="">년도</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}년</option>
                    ))}
                  </select>

                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required
                    className="flex-1 bg-white/20 border-pink-300 text-pink-200 rounded-md h-10 px-3"
                  >
                    <option value="">월</option>
                    {months.map(m => (
                      <option key={m} value={m.toString().padStart(2, '0')}>{m}월</option>
                    ))}
                  </select>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    required
                    className="flex-1 bg-white/20 border-pink-300 text-pink-200 rounded-md h-10 px-3"
                  >
                    <option value="">일</option>
                    {days.map(d => (
                      <option key={d} value={d.toString().padStart(2, '0')}>{d}일</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-pink-300">
                  <ClockIcon className="inline-block mr-2" />
                  태어난 시간
                </Label>
                <div className="flex gap-2 mt-2">
                  <select
                    value={birthTime.split(':')[0] || ''}
                    onChange={(e) => {
                      const hour = e.target.value.padStart(2, '0')
                      const minute = birthTime.split(':')[1] || '00'
                      setBirthTime(`${hour}:${minute}`)
                    }}
                    required
                    className="flex-1 bg-white/20 border-pink-300 text-pink-200 rounded-md h-10 px-3"
                  >
                    <option value="">시</option>
                    {hours.map(h => (
                      <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}시</option>
                    ))}
                  </select>
                  <select
                    value={birthTime.split(':')[1] || ''}
                    onChange={(e) => {
                      const hour = birthTime.split(':')[0] || '00'
                      const minute = e.target.value
                      setBirthTime(`${hour}:${minute}`)
                    }}
                    required
                    className="flex-1 bg-white/20 border-pink-300 text-pink-200 rounded-md h-10 px-3"
                  >
                    <option value="">분</option>
                    {minuteOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-pink-300">
                  <UserIcon className="inline-block mr-2" />
                  태어난 성별<span className="text-pink-500 ml-1">*</span>
                </Label>
                <RadioGroup 
                  value={gender} 
                  onValueChange={setGender} 
                  className="flex space-x-6 mt-3"
                  required
                >
                  <div className="flex items-center">
                    <Label 
                      htmlFor="male" 
                      className="flex items-center space-x-2 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-white/5"
                    >
                      <RadioGroupItem value="male" id="male" className="w-4 h-4 text-pink-500" />
                      <span className="text-pink-200">남</span>
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <Label 
                      htmlFor="female" 
                      className="flex items-center space-x-2 cursor-pointer py-1.5 px-3 rounded-lg hover:bg-white/5"
                    >
                      <RadioGroupItem value="female" id="female" className="w-4 h-4 text-pink-500" />
                      <span className="text-pink-200">여</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                🔮 운세 보기
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <Card className="mt-8 bg-white/10 backdrop-blur-md border-none shadow-lg overflow-hidden mx-[-8px] sm:mx-0">
            <CardContent className="pt-6">
              <p className="mb-4 text-lg font-medium text-pink-200 text-center">
                잠시만 기다려 달라냥~ 🐱
              </p>
              <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                <div 
                  className="bg-pink-500 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && fortune && (
          <Card className="mt-8 bg-white/10 backdrop-blur-md border-none shadow-lg overflow-hidden mx-[-8px] sm:mx-0">
            <CardContent className="pt-6">
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src={fortune.imageUrl || "/placeholder.svg"}
                  alt="운세 이미지"
                  fill
                  className="rounded-lg border-4 border-pink-300 object-cover"
                />
              </div>
              <div className="prose prose-invert prose-pink max-w-none [&>*]:m-0 [&>*]:pl-0 space-y-6">
                {fortune.imageDescription && (
                  <p className="text-pink-200">
                    {fortune.imageDescription}
                  </p>
                )}
                <div className="pt-4 border-t border-pink-300/30">
                  <ReactMarkdown>
                    {fortune.fortuneText}
                  </ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

