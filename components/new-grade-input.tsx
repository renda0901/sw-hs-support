"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { Loader2, Calculator } from "lucide-react"

interface NewGradeInputProps {
  userId?: string
}

interface Subject {
  id: string
  name: string
  description: string | null
}

interface EvaluationType {
  id: string
  subject_id: string
  name: string
  type: string
  weight: number
  max_score: number | null
  description: string | null
}

interface GradeData {
  [evaluationTypeId: string]: string
}

export default function NewGradeInput({ userId }: NewGradeInputProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationType[]>([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [gradeData, setGradeData] = useState<GradeData>({})
  const [examDate, setExamDate] = useState("")
  const [notes, setNotes] = useState("")
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      fetchEvaluationTypes(selectedSubject)
      setGradeData({})
      setFinalScore(null)
    }
  }, [selectedSubject])

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase.from("subjects").select("*").eq("is_active", true).order("name")

      if (error) {
        setError("과목 데이터를 불러올 수 없습니다.")
        return
      }

      setSubjects(data || [])
    } catch (err) {
      setError("과목 데이터를 불러올 수 없습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEvaluationTypes = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from("evaluation_types")
        .select("*")
        .eq("subject_id", subjectId)
        .eq("is_active", true)
        .order("weight", { ascending: false })

      if (error) {
        setError("평가 유형 데이터를 불러올 수 없습니다.")
        return
      }

      setEvaluationTypes(data || [])
    } catch (err) {
      setError("평가 유형 데이터를 불러올 수 없습니다.")
    }
  }

  const calculateFinalScore = () => {
    if (!selectedSubject || evaluationTypes.length === 0) return

    let totalWeightedScore = 0
    let totalWeight = 0
    let hasAllScores = true

    evaluationTypes.forEach((evalType) => {
      const score = Number.parseFloat(gradeData[evalType.id] || "0")
      const maxScore = evalType.max_score || 100

      if (gradeData[evalType.id] && gradeData[evalType.id].trim() !== "") {
        // 점수를 100점 만점으로 환산
        const normalizedScore = (score / maxScore) * 100
        totalWeightedScore += normalizedScore * (evalType.weight / 100)
        totalWeight += evalType.weight
      } else {
        hasAllScores = false
      }
    })

    if (hasAllScores && totalWeight > 0) {
      setFinalScore(totalWeightedScore)
    } else {
      setFinalScore(null)
    }
  }

  useEffect(() => {
    calculateFinalScore()
  }, [gradeData, evaluationTypes])

  const handleGradeChange = (evaluationTypeId: string, value: string) => {
    const evalType = evaluationTypes.find((et) => et.id === evaluationTypeId)
    if (!evalType) return

    const maxScore = evalType.max_score || 100
    const numValue = Number.parseFloat(value)

    if (value === "" || (numValue >= 0 && numValue <= maxScore)) {
      setGradeData({ ...gradeData, [evaluationTypeId]: value })
    }
  }

  const saveGrades = async () => {
    if (!finalScore || !selectedSubject || !userId) {
      setError("모든 필드를 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // 각 평가 유형별로 성적 저장
      const gradePromises = evaluationTypes
        .filter((evalType) => gradeData[evalType.id] && gradeData[evalType.id].trim() !== "")
        .map((evalType) => {
          const score = Number.parseFloat(gradeData[evalType.id])
          return supabase.from("student_grades").upsert(
            {
              user_id: userId,
              subject_id: selectedSubject,
              evaluation_type_id: evalType.id,
              score,
              exam_date: examDate || null,
              notes: notes || null,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,subject_id,evaluation_type_id",
            },
          )
        })

      const results = await Promise.all(gradePromises)
      const hasError = results.some((result) => result.error)

      if (hasError) {
        setError("성적 저장 중 오류가 발생했습니다.")
        return
      }

      const selectedSubjectName = subjects.find((s) => s.id === selectedSubject)?.name || ""
      setSuccess(`${selectedSubjectName} 성적이 저장되었습니다: ${finalScore.toFixed(2)}점`)

      // 폼 초기화
      setSelectedSubject("")
      setGradeData({})
      setExamDate("")
      setNotes("")
      setFinalScore(null)
      setEvaluationTypes([])
    } catch (err) {
      console.error("Save error:", err)
      setError("성적 저장 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWrittenEvaluations = () => evaluationTypes.filter((et) => et.type === "written")
  const getPerformanceEvaluations = () => evaluationTypes.filter((et) => et.type === "performance")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>성적 입력</CardTitle>
          <CardDescription>새로운 성적을 입력하고 계산해보세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* 과목 선택 */}
          <div className="space-y-2">
            <Label htmlFor="subject">과목</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="과목을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubject && evaluationTypes.length > 0 && (
            <>
              {/* 평가 비율 표시 */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-sm">평가 비율</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {evaluationTypes.map((evalType) => (
                      <Badge key={evalType.id} variant="outline">
                        {evalType.name}: {evalType.weight}%
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 지필평가 */}
              {getWrittenEvaluations().length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">지필평가</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getWrittenEvaluations().map((evalType) => (
                      <div key={evalType.id} className="space-y-2">
                        <Label htmlFor={evalType.id}>
                          {evalType.name} ({evalType.weight}% 반영)
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={evalType.id}
                            type="number"
                            placeholder={`점수 입력 (0-${evalType.max_score})`}
                            value={gradeData[evalType.id] || ""}
                            onChange={(e) => handleGradeChange(evalType.id, e.target.value)}
                            max={evalType.max_score || 100}
                            min="0"
                          />
                          <span className="text-sm text-gray-500">/ {evalType.max_score}점</span>
                        </div>
                        {evalType.description && <p className="text-xs text-gray-500">{evalType.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 수행평가 */}
              {getPerformanceEvaluations().length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">수행평가</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getPerformanceEvaluations().map((evalType) => (
                      <div key={evalType.id} className="space-y-2">
                        <Label htmlFor={evalType.id}>
                          {evalType.name} ({evalType.weight}% 반영)
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={evalType.id}
                            type="number"
                            placeholder={`점수 입력 (0-${evalType.max_score})`}
                            value={gradeData[evalType.id] || ""}
                            onChange={(e) => handleGradeChange(evalType.id, e.target.value)}
                            max={evalType.max_score || 100}
                            min="0"
                          />
                          <span className="text-sm text-gray-500">/ {evalType.max_score}점</span>
                        </div>
                        {evalType.description && <p className="text-xs text-gray-500">{evalType.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 추가 정보 */}
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exam_date">시험 날짜 (선택사항)</Label>
                  <Input id="exam_date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">메모 (선택사항)</Label>
                  <Textarea
                    id="notes"
                    placeholder="추가 메모를 입력하세요"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* 계산 결과 */}
              {finalScore !== null && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2 flex items-center justify-center space-x-2">
                        <Calculator className="w-5 h-5" />
                        <span>최종 성적</span>
                      </h3>
                      <p className="text-3xl font-bold text-green-600">{finalScore.toFixed(2)}점</p>
                      <div className="mt-4 text-sm text-gray-600">
                        <p>가중평균으로 계산된 100점 만점 기준 점수입니다.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 저장 버튼 */}
              <Button onClick={saveGrades} className="w-full" disabled={isSubmitting || finalScore === null}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "성적 저장하기"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
