"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface GradeHistoryProps {
  userId?: string
}

interface Grade {
  id: string
  subject: string
  exam_type: string
  final_score: number
  created_at: string
  written_score: number | null
  performance_score_1: number | null
  performance_score_2: number | null
  performance_score_3: number | null
}

export default function GradeHistory({ userId }: GradeHistoryProps) {
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (userId) {
      fetchGrades()
    }
  }, [userId])

  const fetchGrades = async () => {
    if (!userId) return

    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Fetch grades error:", error)
        setError("성적 기록을 불러올 수 없습니다.")
        return
      }

      setGrades(data || [])
    } catch (err) {
      console.error("Fetch error:", err)
      setError("성적 기록을 불러올 수 없습니다.")
    } finally {
      setIsLoading(false)
    }
  }

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

  const filteredGrades = grades.filter((grade) => {
    const subjectMatch = selectedSubject === "all" || grade.subject === selectedSubject
    return subjectMatch
  })

  const subjectAverages = grades.reduce(
    (acc, grade) => {
      if (!acc[grade.subject]) {
        acc[grade.subject] = { total: 0, count: 0 }
      }
      acc[grade.subject].total += grade.final_score
      acc[grade.subject].count += 1
      return acc
    },
    {} as Record<string, { total: number; count: number }>,
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>성적 기록</CardTitle>
          <CardDescription>과거 성적 기록을 확인하고 분석해보세요</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
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
                <SelectItem value="한국사">한국사</SelectItem>
                <SelectItem value="사회">사회</SelectItem>
                <SelectItem value="과학">과학</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 과목별 평균 */}
      {Object.keys(subjectAverages).length > 0 && (
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
      )}

      {/* 성적 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>상세 기록</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGrades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">아직 입력된 성적이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">성적 입력 탭에서 새로운 성적을 추가해보세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGrades.map((grade, index) => {
                const previousGrade = filteredGrades[index + 1]
                const trend =
                  previousGrade && previousGrade.subject === grade.subject
                    ? getScoreTrend(grade.final_score, previousGrade.final_score)
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
                          <Badge variant="outline">{grade.exam_type}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(grade.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {grade.written_score && (
                          <p className="text-xs text-gray-400 mt-1">
                            지필: {grade.written_score}점 | 수행:{" "}
                            {grade.performance_score_1 && grade.performance_score_2 && grade.performance_score_3
                              ? (
                                  (grade.performance_score_1 + grade.performance_score_2 + grade.performance_score_3) /
                                  3
                                ).toFixed(1)
                              : "N/A"}
                            점
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(trend)}
                      <span className={`text-xl font-bold ${getScoreColor(grade.final_score)}`}>
                        {grade.final_score.toFixed(1)}점
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
