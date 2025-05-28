"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function GradeHistory() {
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("all")

  // 모의 데이터
  const gradeHistory = [
    { id: 1, subject: "국어", type: "중간고사", score: 85, date: "2024-01-15", semester: "1학기" },
    { id: 2, subject: "국어", type: "수행평가", score: 88, date: "2024-01-10", semester: "1학기" },
    { id: 3, subject: "수학", type: "중간고사", score: 92, date: "2024-01-12", semester: "1학기" },
    { id: 4, subject: "수학", type: "수행평가", score: 89, date: "2024-01-08", semester: "1학기" },
    { id: 5, subject: "영어", type: "모의고사", score: 78, date: "2024-01-05", semester: "1학기" },
    { id: 6, subject: "영어", type: "수행평가", score: 82, date: "2024-01-03", semester: "1학기" },
  ]

  const getScoreTrend = (currentScore: number, previousScore?: number) => {
    if (!previousScore) return null
    if (currentScore > previousScore) return "up"
    if (currentScore < previousScore) return "down"
    return "same"
  }

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case "same":
        return <Minus className="w-4 h-4 text-gray-500" />
      default:
        return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredGrades = gradeHistory.filter((grade) => {
    const subjectMatch = selectedSubject === "all" || grade.subject === selectedSubject
    const periodMatch = selectedPeriod === "all" || grade.semester === selectedPeriod
    return subjectMatch && periodMatch
  })

  const subjectAverages = gradeHistory.reduce(
    (acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = { total: 0, count: 0 }
      }
      acc[grade.subject].total += grade.score
      acc[grade.subject].count += 1
      return acc
    },
    {} as Record<string, { total: number; count: number }>,
  )

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>성적 기록</CardTitle>
          <CardDescription>과거 성적 기록을 확인하고 분석해보세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="과목 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 과목</SelectItem>
                <SelectItem value="국어">국어</SelectItem>
                <SelectItem value="수학">수학</SelectItem>
                <SelectItem value="영어">영어</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="1학기">1학기</SelectItem>
                <SelectItem value="2학기">2학기</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 과목별 평균 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(subjectAverages).map(([subject, data]) => (
          <Card key={subject}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{subject} 평균</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data.total / data.count).toFixed(1)}점</div>
              <p className="text-xs text-muted-foreground">총 {data.count}회 평가</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 성적 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>상세 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGrades.map((grade, index) => {
              const previousGrade = filteredGrades[index + 1]
              const trend =
                previousGrade && previousGrade.subject === grade.subject
                  ? getScoreTrend(grade.score, previousGrade.score)
                  : null

              return (
                <div
                  key={grade.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{grade.subject}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{grade.type}</Badge>
                        <span className="text-sm text-gray-500">{grade.date}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{grade.semester}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(trend)}
                    <span className={`text-xl font-bold ${getScoreColor(grade.score)}`}>{grade.score}점</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
