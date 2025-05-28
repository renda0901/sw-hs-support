"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Loader2, Settings } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface SubjectEvaluationManagerProps {
  adminId?: string
}

interface Subject {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

interface EvaluationType {
  id: string
  subject_id: string
  name: string
  type: string
  weight: number
  max_score: number | null
  description: string | null
  is_active: boolean
  created_at: string
  subject?: Subject
}

export default function SubjectEvaluationManager({ adminId }: SubjectEvaluationManagerProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("subjects")

  // 과목 폼 상태
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    description: "",
  })
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)

  // 평가 유형 폼 상태
  const [evaluationForm, setEvaluationForm] = useState({
    subject_id: "",
    name: "",
    type: "written",
    weight: "",
    max_score: "100",
    description: "",
  })
  const [editingEvaluationId, setEditingEvaluationId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 과목 데이터 가져오기
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .order("name", { ascending: true })

      if (subjectsError) {
        setError("과목 데이터를 불러올 수 없습니다.")
        return
      }

      // 평가 유형 데이터 가져오기
      const { data: evaluationData, error: evaluationError } = await supabase
        .from("evaluation_types")
        .select(`
          *,
          subject:subjects(*)
        `)
        .order("subject_id", { ascending: true })
        .order("weight", { ascending: false })

      if (evaluationError) {
        setError("평가 유형 데이터를 불러올 수 없습니다.")
        return
      }

      setSubjects(subjectsData || [])
      setEvaluationTypes(evaluationData || [])
    } catch (err) {
      setError("데이터를 불러올 수 없습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminId) return

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (editingSubjectId) {
        // 수정
        const { error } = await supabase
          .from("subjects")
          .update({
            name: subjectForm.name,
            description: subjectForm.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingSubjectId)

        if (error) {
          setError("과목 수정 중 오류가 발생했습니다.")
          return
        }

        setSuccess("과목이 수정되었습니다.")
        setEditingSubjectId(null)
      } else {
        // 새로 추가
        const { error } = await supabase.from("subjects").insert({
          name: subjectForm.name,
          description: subjectForm.description || null,
          created_by: adminId,
        })

        if (error) {
          setError("과목 추가 중 오류가 발생했습니다.")
          return
        }

        setSuccess("과목이 추가되었습니다.")
      }

      // 폼 초기화
      setSubjectForm({ name: "", description: "" })
      fetchData()
    } catch (err) {
      setError("오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminId) return

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (editingEvaluationId) {
        // 수정
        const { error } = await supabase
          .from("evaluation_types")
          .update({
            subject_id: evaluationForm.subject_id,
            name: evaluationForm.name,
            type: evaluationForm.type,
            weight: Number.parseFloat(evaluationForm.weight),
            max_score: Number.parseInt(evaluationForm.max_score) || 100,
            description: evaluationForm.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingEvaluationId)

        if (error) {
          setError("평가 유형 수정 중 오류가 발생했습니다.")
          return
        }

        setSuccess("평가 유형이 수정되었습니다.")
        setEditingEvaluationId(null)
      } else {
        // 새로 추가
        const { error } = await supabase.from("evaluation_types").insert({
          subject_id: evaluationForm.subject_id,
          name: evaluationForm.name,
          type: evaluationForm.type,
          weight: Number.parseFloat(evaluationForm.weight),
          max_score: Number.parseInt(evaluationForm.max_score) || 100,
          description: evaluationForm.description || null,
          created_by: adminId,
        })

        if (error) {
          setError("평가 유형 추가 중 오류가 발생했습니다.")
          return
        }

        setSuccess("평가 유형이 추가되었습니다.")
      }

      // 폼 초기화
      setEvaluationForm({
        subject_id: "",
        name: "",
        type: "written",
        weight: "",
        max_score: "100",
        description: "",
      })
      fetchData()
    } catch (err) {
      setError("오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubject = (subject: Subject) => {
    setSubjectForm({
      name: subject.name,
      description: subject.description || "",
    })
    setEditingSubjectId(subject.id)
  }

  const handleEditEvaluation = (evaluation: EvaluationType) => {
    setEvaluationForm({
      subject_id: evaluation.subject_id,
      name: evaluation.name,
      type: evaluation.type,
      weight: evaluation.weight.toString(),
      max_score: evaluation.max_score?.toString() || "100",
      description: evaluation.description || "",
    })
    setEditingEvaluationId(evaluation.id)
  }

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까? 관련된 모든 평가 유형도 함께 삭제됩니다.")) return

    try {
      const { error } = await supabase.from("subjects").update({ is_active: false }).eq("id", id)

      if (error) {
        setError("삭제 중 오류가 발생했습니다.")
        return
      }

      setSuccess("과목이 삭제되었습니다.")
      fetchData()
    } catch (err) {
      setError("삭제 중 오류가 발생했습니다.")
    }
  }

  const handleDeleteEvaluation = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      const { error } = await supabase.from("evaluation_types").update({ is_active: false }).eq("id", id)

      if (error) {
        setError("삭제 중 오류가 발생했습니다.")
        return
      }

      setSuccess("평가 유형이 삭제되었습니다.")
      fetchData()
    } catch (err) {
      setError("삭제 중 오류가 발생했습니다.")
    }
  }

  const cancelSubjectEdit = () => {
    setEditingSubjectId(null)
    setSubjectForm({ name: "", description: "" })
  }

  const cancelEvaluationEdit = () => {
    setEditingEvaluationId(null)
    setEvaluationForm({
      subject_id: "",
      name: "",
      type: "written",
      weight: "",
      max_score: "100",
      description: "",
    })
  }

  const getSubjectEvaluations = (subjectId: string) => {
    return evaluationTypes.filter((eval) => eval.subject_id === subjectId && eval.is_active)
  }

  const getTotalWeight = (subjectId: string) => {
    return getSubjectEvaluations(subjectId).reduce((total, eval) => total + eval.weight, 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>과목 및 평가 관리</span>
          </CardTitle>
          <CardDescription>과목과 평가 유형을 관리하여 성적 입력 시스템을 설정하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subjects">과목 관리</TabsTrigger>
              <TabsTrigger value="evaluations">평가 유형 관리</TabsTrigger>
            </TabsList>

            <TabsContent value="subjects" className="space-y-6">
              {/* 과목 추가/수정 폼 */}
              <Card>
                <CardHeader>
                  <CardTitle>{editingSubjectId ? "과목 수정" : "새 과목 추가"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubjectSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject-name">과목명</Label>
                      <Input
                        id="subject-name"
                        placeholder="과목명을 입력하세요"
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject-description">설명 (선택사항)</Label>
                      <Textarea
                        id="subject-description"
                        placeholder="과목에 대한 설명을 입력하세요"
                        value={subjectForm.description}
                        onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingSubjectId ? "수정 중..." : "추가 중..."}
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            {editingSubjectId ? "수정하기" : "추가하기"}
                          </>
                        )}
                      </Button>
                      {editingSubjectId && (
                        <Button type="button" variant="outline" onClick={cancelSubjectEdit}>
                          취소
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* 과목 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle>등록된 과목</CardTitle>
                </CardHeader>
                <CardContent>
                  {subjects.filter((s) => s.is_active).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">등록된 과목이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {subjects
                        .filter((s) => s.is_active)
                        .map((subject) => {
                          const totalWeight = getTotalWeight(subject.id)
                          const evaluationCount = getSubjectEvaluations(subject.id).length
                          return (
                            <div
                              key={subject.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-medium">{subject.name}</h3>
                                  <Badge variant="outline">{evaluationCount}개 평가</Badge>
                                  <Badge variant={totalWeight === 100 ? "default" : "destructive"}>
                                    {totalWeight}% 반영
                                  </Badge>
                                </div>
                                {subject.description && <p className="text-sm text-gray-600">{subject.description}</p>}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditSubject(subject)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDeleteSubject(subject.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluations" className="space-y-6">
              {/* 평가 유형 추가/수정 폼 */}
              <Card>
                <CardHeader>
                  <CardTitle>{editingEvaluationId ? "평가 유형 수정" : "새 평가 유형 추가"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEvaluationSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="eval-subject">과목</Label>
                        <Select
                          value={evaluationForm.subject_id}
                          onValueChange={(value) => setEvaluationForm({ ...evaluationForm, subject_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="과목을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects
                              .filter((s) => s.is_active)
                              .map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eval-type">평가 구분</Label>
                        <Select
                          value={evaluationForm.type}
                          onValueChange={(value) => setEvaluationForm({ ...evaluationForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="평가 구분을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="written">지필평가</SelectItem>
                            <SelectItem value="performance">수행평가</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eval-name">평가명</Label>
                      <Input
                        id="eval-name"
                        placeholder="예: 중간고사, 독서 논술, 발표 평가"
                        value={evaluationForm.name}
                        onChange={(e) => setEvaluationForm({ ...evaluationForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="eval-weight">반영 비율 (%)</Label>
                        <Input
                          id="eval-weight"
                          type="number"
                          placeholder="30"
                          value={evaluationForm.weight}
                          onChange={(e) => setEvaluationForm({ ...evaluationForm, weight: e.target.value })}
                          min="0"
                          max="100"
                          step="0.1"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eval-max-score">만점</Label>
                        <Input
                          id="eval-max-score"
                          type="number"
                          placeholder="100"
                          value={evaluationForm.max_score}
                          onChange={(e) => setEvaluationForm({ ...evaluationForm, max_score: e.target.value })}
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eval-description">설명 (선택사항)</Label>
                      <Textarea
                        id="eval-description"
                        placeholder="평가에 대한 설명을 입력하세요"
                        value={evaluationForm.description}
                        onChange={(e) => setEvaluationForm({ ...evaluationForm, description: e.target.value })}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingEvaluationId ? "수정 중..." : "추가 중..."}
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            {editingEvaluationId ? "수정하기" : "추가하기"}
                          </>
                        )}
                      </Button>
                      {editingEvaluationId && (
                        <Button type="button" variant="outline" onClick={cancelEvaluationEdit}>
                          취소
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* 평가 유형 목록 */}
              <div className="space-y-4">
                {subjects
                  .filter((s) => s.is_active)
                  .map((subject) => {
                    const subjectEvaluations = getSubjectEvaluations(subject.id)
                    const totalWeight = getTotalWeight(subject.id)

                    if (subjectEvaluations.length === 0) return null

                    return (
                      <Card key={subject.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{subject.name}</CardTitle>
                            <Badge variant={totalWeight === 100 ? "default" : "destructive"}>
                              총 {totalWeight}% 반영
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {subjectEvaluations.map((evaluation) => (
                              <div
                                key={evaluation.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium">{evaluation.name}</h4>
                                    <Badge variant={evaluation.type === "written" ? "default" : "secondary"}>
                                      {evaluation.type === "written" ? "지필평가" : "수행평가"}
                                    </Badge>
                                    <Badge variant="outline">{evaluation.weight}%</Badge>
                                    <Badge variant="outline">{evaluation.max_score}점</Badge>
                                  </div>
                                  {evaluation.description && (
                                    <p className="text-sm text-gray-600">{evaluation.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => handleEditEvaluation(evaluation)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteEvaluation(evaluation.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
