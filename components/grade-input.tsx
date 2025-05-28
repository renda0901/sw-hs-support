"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function GradeInput() {
  const [subject, setSubject] = useState("")
  const [examType, setExamType] = useState("")
  const [writtenScore, setWrittenScore] = useState("")
  const [performanceScores, setPerformanceScores] = useState({
    assignment1: "",
    assignment2: "",
    assignment3: "",
  })
  const [finalScore, setFinalScore] = useState<number | null>(null)

  const calculateScore = () => {
    const written = Number.parseFloat(writtenScore) || 0
    const perf1 = Number.parseFloat(performanceScores.assignment1) || 0
    const perf2 = Number.parseFloat(performanceScores.assignment2) || 0
    const perf3 = Number.parseFloat(performanceScores.assignment3) || 0

    // 지필평가 60%, 수행평가 40% 반영
    const writtenPart = written * 0.6
    const performancePart = ((perf1 + perf2 + perf3) / 3) * 0.4

    setFinalScore(writtenPart + performancePart)
  }

  const saveGrade = () => {
    if (finalScore !== null && subject && examType) {
      // 실제로는 서버에 저장
      alert(`${subject} ${examType} 성적이 저장되었습니다: ${finalScore.toFixed(2)}점`)
      // 폼 초기화
      setSubject("")
      setExamType("")
      setWrittenScore("")
      setPerformanceScores({ assignment1: "", assignment2: "", assignment3: "" })
      setFinalScore(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>성적 입력</CardTitle>
          <CardDescription>새로운 성적을 입력하고 계산해보세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">과목</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="과목을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="국어">국어</SelectItem>
                  <SelectItem value="수학">수학</SelectItem>
                  <SelectItem value="영어">영어</SelectItem>
                  <SelectItem value="한국사">한국사</SelectItem>
                  <SelectItem value="사회">사회</SelectItem>
                  <SelectItem value="과학">과학</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="examType">평가 유형</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger>
                  <SelectValue placeholder="평가 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="중간고사">중간고사</SelectItem>
                  <SelectItem value="기말고사">기말고사</SelectItem>
                  <SelectItem value="모의고사">모의고사</SelectItem>
                  <SelectItem value="수행평가">수행평가</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* 지필평가 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">지필평가 (60% 반영)</h3>
            <div className="space-y-2">
              <Label htmlFor="written">지필평가 점수</Label>
              <Input
                id="written"
                type="number"
                placeholder="점수를 입력하세요 (0-100)"
                value={writtenScore}
                onChange={(e) => setWrittenScore(e.target.value)}
                max="100"
                min="0"
              />
            </div>
          </div>

          <Separator />

          {/* 수행평가 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">수행평가 (40% 반영)</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignment1">과제 1 (독서 논술)</Label>
                <Input
                  id="assignment1"
                  type="number"
                  placeholder="점수를 입력하세요 (0-100)"
                  value={performanceScores.assignment1}
                  onChange={(e) => setPerformanceScores({ ...performanceScores, assignment1: e.target.value })}
                  max="100"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment2">과제 2 (매체 논술)</Label>
                <Input
                  id="assignment2"
                  type="number"
                  placeholder="점수를 입력하세요 (0-100)"
                  value={performanceScores.assignment2}
                  onChange={(e) => setPerformanceScores({ ...performanceScores, assignment2: e.target.value })}
                  max="100"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment3">과제 3 (발표)</Label>
                <Input
                  id="assignment3"
                  type="number"
                  placeholder="점수를 입력하세요 (0-100)"
                  value={performanceScores.assignment3}
                  onChange={(e) => setPerformanceScores({ ...performanceScores, assignment3: e.target.value })}
                  max="100"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={calculateScore} className="flex-1">
              점수 계산하기
            </Button>
            {finalScore !== null && (
              <Button onClick={saveGrade} variant="outline" className="flex-1">
                성적 저장하기
              </Button>
            )}
          </div>

          {finalScore !== null && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">계산 결과</h3>
                  <p className="text-3xl font-bold text-blue-600">{finalScore.toFixed(2)}점</p>
                  <p className="text-sm text-gray-600 mt-2">
                    지필평가: {(Number.parseFloat(writtenScore) * 0.6).toFixed(1)}점 + 수행평가:{" "}
                    {(
                      (((Number.parseFloat(performanceScores.assignment1) || 0) +
                        (Number.parseFloat(performanceScores.assignment2) || 0) +
                        (Number.parseFloat(performanceScores.assignment3) || 0)) /
                        3) *
                      0.4
                    ).toFixed(1)}
                    점
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
