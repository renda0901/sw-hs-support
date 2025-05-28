"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface StudyPlannerProps {
  userId?: string
}

export default function StudyPlanner({ userId }: StudyPlannerProps) {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [currentScore, setCurrentScore] = useState("")
  const [targetScore, setTargetScore] = useState("")
  const [timeFrame, setTimeFrame] = useState("")
  const [plan, setPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [examSchedules, setExamSchedules] = useState<any[]>([])

  // 현재 성적 데이터 (모의)
  const currentGrades = {
    국어: 85,
    수학: 78,
    영어: 82,
    한국사: 88,
    사회: 75,
    과학: 80,
  }

  useEffect(() => {
    fetchUpcomingExams()
  }, [])

  const fetchUpcomingExams = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const { data } = await supabase
        .from("exam_schedules")
        .select("*")
        .gte("exam_date", today)
        .order("exam_date", { ascending: true })
        .limit(5)

      setExamSchedules(data || [])
    } catch (error) {
      console.error("Error fetching exam schedules:", error)
    }
  }

  const calculatePlan = () => {
    const current = Number.parseFloat(currentScore) || currentGrades[selectedSubject as keyof typeof currentGrades] || 0
    const target = Number.parseFloat(targetScore) || 0
    const weeks = Number.parseInt(timeFrame) || 0

    if (!selectedSubject || target <= current || weeks <= 0) {
      setError("올바른 값을 입력해주세요.")
      return
    }

    const scoreDiff = target - current
    const weeklyImprovement = scoreDiff / weeks
    const difficulty = scoreDiff > 15 ? "어려움" : scoreDiff > 8 ? "보통" : "쉬움"

    const studyHours = Math.ceil(scoreDiff * 2) // 점수 차이 * 2시간
    const weeklyHours = Math.ceil(studyHours / weeks)

    setPlan({
      subject: selectedSubject,
      current,
      target,
      scoreDiff,
      weeks,
      weeklyImprovement,
      difficulty,
      totalStudyHours: studyHours,
      weeklyHours,
      recommendations: generateRecommendations(selectedSubject, scoreDiff, difficulty),
    })
  }

  const savePlan = async () => {
    if (!plan || !userId) {
      setError("학습 계획을 먼저 생성해주세요.")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase.from("study_plans").insert({
        user_id: userId,
        subject: plan.subject,
        current_score: plan.current,
        target_score: plan.target,
        time_frame: plan.weeks,
        difficulty: plan.difficulty,
        total_study_hours: plan.totalStudyHours,
        weekly_hours: plan.weeklyHours,
      })

      if (error) {
        setError("학습 계획 저장 중 오류가 발생했습니다.")
        return
      }

      setSuccess("학습 계획이 저장되었습니다.")
    } catch (err) {
      setError("학습 계획 저장 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecommendations = (subject: string, scoreDiff: number, difficulty: string) => {
    const baseRecommendations = {
      국어: [
        "매일 독서 30분 이상",
        "문학 작품 분석 연습",
        "어휘력 향상을 위한 단어장 작성",
        "기출문제 풀이 및 오답노트 작성",
      ],
      수학: ["개념 정리 및 공식 암기", "단계별 문제 풀이 연습", "오답노트 작성 및 복습", "모의고사 시간 단축 연습"],
      영어: ["매일 영단어 50개 암기", "영어 지문 독해 연습", "듣기 평가 대비 연습", "영작문 연습"],
    }

    const recommendations = baseRecommendations[subject as keyof typeof baseRecommendations] || [
      "기본 개념 정리",
      "문제 풀이 연습",
      "오답노트 작성",
      "모의고사 응시",
    ]

    if (difficulty === "어려움") {
      recommendations.push("개인 과외 또는 학원 수강 고려")
      recommendations.push("스터디 그룹 참여")
    }

    return recommendations
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "쉬움":
        return "text-green-600"
      case "보통":
        return "text-yellow-600"
      case "어려움":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* 다가오는 시험 정보 */}
      {examSchedules.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">다가오는 시험 일정</CardTitle>
            <CardDescription className="text-blue-700">시험에 맞춰 학습 계획을 세워보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examSchedules.slice(0, 4).map((exam) => {
                const daysUntil = Math.ceil(
                  (new Date(exam.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )
                return (
                  <div key={exam.id} className="p-3 bg-white rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-900">
                      {exam.subject} {exam.exam_type}
                    </p>
                    <p className="text-sm text-blue-700">
                      {new Date(exam.exam_date).toLocaleDateString()} (D-{daysUntil})
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>학습 계획 수립</span>
          </CardTitle>
          <CardDescription>목표 점수 달성을 위한 맞춤형 학습 계획을 세워보세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">과목</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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
              <Label htmlFor="timeFrame">목표 기간 (주)</Label>
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger>
                  <SelectValue placeholder="기간을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4주</SelectItem>
                  <SelectItem value="8">8주</SelectItem>
                  <SelectItem value="12">12주</SelectItem>
                  <SelectItem value="16">16주</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current">현재 점수</Label>
              <Input
                id="current"
                type="number"
                placeholder={
                  selectedSubject
                    ? `현재: ${currentGrades[selectedSubject as keyof typeof currentGrades] || 0}점`
                    : "현재 점수"
                }
                value={currentScore}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
                    setCurrentScore(value)
                  }
                }}
                max="100"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">목표 점수</Label>
              <Input
                id="target"
                type="number"
                placeholder="목표 점수를 입력하세요"
                value={targetScore}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
                    setTargetScore(value)
                  }
                }}
                max="100"
                min="0"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={calculatePlan} className="flex-1">
              학습 계획 생성하기
            </Button>
            {plan && (
              <Button onClick={savePlan} variant="outline" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "계획 저장"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {plan && (
        <div className="space-y-6">
          {/* 계획 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>계획 요약</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">현재 점수</p>
                  <p className="text-2xl font-bold text-blue-600">{plan.current}점</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">목표 점수</p>
                  <p className="text-2xl font-bold text-green-600">{plan.target}점</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">필요한 향상</p>
                  <p className="text-2xl font-bold text-orange-600">+{plan.scoreDiff}점</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">난이도</p>
                  <p className={`text-2xl font-bold ${getDifficultyColor(plan.difficulty)}`}>{plan.difficulty}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>진행률</span>
                  <span>0% / 100%</span>
                </div>
                <Progress value={0} className="w-full" />
              </div>
            </CardContent>
          </Card>

          {/* 학습 계획 */}
          <Card>
            <CardHeader>
              <CardTitle>주간 학습 계획</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">학습 시간</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>총 필요 시간:</span>
                      <span className="font-medium">{plan.totalStudyHours}시간</span>
                    </div>
                    <div className="flex justify-between">
                      <span>주당 학습 시간:</span>
                      <span className="font-medium">{plan.weeklyHours}시간</span>
                    </div>
                    <div className="flex justify-between">
                      <span>일일 학습 시간:</span>
                      <span className="font-medium">{Math.ceil(plan.weeklyHours / 7)}시간</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">목표 달성</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>주당 향상 목표:</span>
                      <span className="font-medium">+{plan.weeklyImprovement.toFixed(1)}점</span>
                    </div>
                    <div className="flex justify-between">
                      <span>목표 달성일:</span>
                      <span className="font-medium">{plan.weeks}주 후</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 추천 학습 방법 */}
          <Card>
            <CardHeader>
              <CardTitle>추천 학습 방법</CardTitle>
              <CardDescription>{plan.subject} 성적 향상을 위한 맞춤 학습법</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>

              {plan.difficulty === "어려움" && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">주의사항</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        목표 달성이 어려울 수 있습니다. 현실적인 목표 설정을 고려해보세요.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
