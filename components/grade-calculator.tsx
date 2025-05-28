"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function GradeCalculator() {
  const [subject, setSubject] = useState<string>("언어와 매체")
  const [examType, setExamType] = useState<string>("중간고사")
  const [writtenScore, setWrittenScore] = useState<string>("")
  const [bookReportScore, setBookReportScore] = useState<string>("")
  const [presentationScore, setPresentationScore] = useState<string>("")
  const [participationScore, setParticipationScore] = useState<string>("")
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [daysLeft, setDaysLeft] = useState<number>(7)

  const calculateScore = () => {
    const written = Number.parseFloat(writtenScore) || 0
    const bookReport = Number.parseFloat(bookReportScore) || 0
    const presentation = Number.parseFloat(presentationScore) || 0
    const participation = Number.parseFloat(participationScore) || 0

    // 지필평가 60%, 수행평가 40% 반영
    const writtenPart = written * 0.6
    const performancePart = (bookReport * 0.4 + presentation * 0.4 + participation * 0.2) * 0.4

    setFinalScore(writtenPart + performancePart)
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h1 className="text-xl font-bold text-center">학업 보조 웹사이트</h1>
      </div>

      <div className="flex items-center justify-center space-x-4 py-6">
        <button className="text-gray-400">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold">D-{daysLeft}</h2>
          <p className="text-sm text-gray-500">대수능모의평가</p>
          <div className="flex justify-center space-x-1 mt-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          </div>
        </div>
        <button className="text-gray-400">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <Collapsible className="border rounded-lg bg-gray-50">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
          <span className="font-medium">일정표</span>
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 pt-0">
          <p>다가오는 시험 및 과제 일정이 표시됩니다.</p>
        </CollapsibleContent>
      </Collapsible>

      <div className="border rounded-lg p-4">
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger>
            <SelectValue placeholder="과목 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="언어와 매체">언어와 매체</SelectItem>
            <SelectItem value="수학">수학</SelectItem>
            <SelectItem value="영어">영어</SelectItem>
            <SelectItem value="사회">사회</SelectItem>
            <SelectItem value="과학">과학</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg p-4">
        <p className="text-sm">반영비율: 지필평가 60% + 수행평가 40%</p>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium border-b pb-2">지필평가 점수 계산기</h3>

        <div className="space-y-4">
          <Select value={examType} onValueChange={setExamType}>
            <SelectTrigger>
              <SelectValue placeholder="평가 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="중간고사">중간고사</SelectItem>
              <SelectItem value="기말고사">기말고사</SelectItem>
              <SelectItem value="모의고사">모의고사</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="점수를 서세요 (예: 12345..)"
            value={writtenScore}
            onChange={(e) => setWrittenScore(e.target.value)}
          />

          <p className="text-xs text-gray-500">* 실점수 입력은 숫자 '0'으로 입력해주세요</p>

          <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={calculateScore}>
            점수 계산하기
          </Button>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium border-b pb-2">원점수 계산기</h3>

        <div className="space-y-4">
          <h4 className="font-medium">수행평가 영역</h4>

          <div className="space-y-2">
            <p className="text-sm">독서 논술 (25점)</p>
            <Input
              type="text"
              placeholder="수행평가 점수를 입력해주세요"
              value={bookReportScore}
              onChange={(e) => setBookReportScore(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm">매체 논술 (10점)</p>
            <Input
              type="text"
              placeholder="수행평가 점수를 입력해주세요"
              value={presentationScore}
              onChange={(e) => setPresentationScore(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm">매체 발표 (5점)</p>
            <Input
              type="text"
              placeholder="수행평가 점수를 입력해주세요"
              value={participationScore}
              onChange={(e) => setParticipationScore(e.target.value)}
            />
          </div>
        </div>
      </div>

      {finalScore !== null && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-medium text-center">계산 결과</h3>
          <p className="text-center text-xl font-bold mt-2">{finalScore.toFixed(2)}점</p>
        </div>
      )}
    </div>
  )
}
