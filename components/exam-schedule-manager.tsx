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
import { Calendar, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ExamScheduleManagerProps {
  adminId?: string
  onUpdate?: () => void
}

interface ExamSchedule {
  id: string
  subject: string
  exam_type: string
  exam_date: string
  description: string | null
  grade: string
  created_at: string
}

export default function ExamScheduleManager({ adminId, onUpdate }: ExamScheduleManagerProps) {
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    subject: "",
    exam_type: "",
    exam_date: "",
    description: "",
    grade: "",
  })

  useEffect(() => {
    fetchExamSchedules()
  }, [])

  const fetchExamSchedules = async () => {
    try {
      const { data, error } = await supabase.from("exam_schedules").select("*").order("exam_date", { ascending: true })

      if (error) {
        setError("시험 일정을 불러올 수 없습니다.")
        return
      }

      setExamSchedules(data || [])
    } catch (err) {
      setError("시험 일정을 불러올 수 없습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminId) return

    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      if (editingId) {
        // 수정
        const { error } = await supabase
          .from("exam_schedules")
          .update({
            subject: formData.subject,
            exam_type: formData.exam_type,
            exam_date: formData.exam_date,
            description: formData.description || null,
            grade: formData.grade,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) {
          setError("시험 일정 수정 중 오류가 발생했습니다.")
          return
        }

        setSuccess("시험 일정이 수정되었습니다.")
        setEditingId(null)
      } else {
        // 새로 추가
        const { error } = await supabase.from("exam_schedules").insert({
          subject: formData.subject,
          exam_type: formData.exam_type,
          exam_date: formData.exam_date,
          description: formData.description || null,
          grade: formData.grade,
          created_by: adminId,
        })

        if (error) {
          setError("시험 일정 추가 중 오류가 발생했습니다.")
          return
        }

        setSuccess("시험 일정이 추가되었습니다.")
      }

      // 폼 초기화
      setFormData({
        subject: "",
        exam_type: "",
        exam_date: "",
        description: "",
        grade: "",
      })

      fetchExamSchedules()
      onUpdate?.()
    } catch (err) {
      setError("오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (exam: ExamSchedule) => {
    setFormData({
      subject: exam.subject,
      exam_type: exam.exam_type,
      exam_date: exam.exam_date,
      description: exam.description || "",
      grade: exam.grade,
    })
    setEditingId(exam.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      const { error } = await supabase.from("exam_schedules").delete().eq("id", id)

      if (error) {
        setError("삭제 중 오류가 발생했습니다.")
        return
      }

      setSuccess("시험 일정이 삭제되었습니다.")
      fetchExamSchedules()
      onUpdate?.()
    } catch (err) {
      setError("삭제 중 오류가 발생했습니다.")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({
      subject: "",
      exam_type: "",
      exam_date: "",
      description: "",
      grade: "",
    })
  }

  const getDaysUntilExam = (examDate: string) => {
    const today = new Date()
    const exam = new Date(examDate)
    const diffTime = exam.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
      {/* 시험 일정 추가/수정 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>{editingId ? "시험 일정 수정" : "새 시험 일정 추가"}</span>
          </CardTitle>
          <CardDescription>{editingId ? "시험 일정을 수정하세요" : "새로운 시험 일정을 등록하세요"}</CardDescription>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">과목</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                >
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
                <Label htmlFor="exam_type">시험 유형</Label>
                <Select
                  value={formData.exam_type}
                  onValueChange={(value) => setFormData({ ...formData, exam_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="시험 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="중간고사">중간고사</SelectItem>
                    <SelectItem value="기말고사">기말고사</SelectItem>
                    <SelectItem value="모의고사">모의고사</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam_date">시험 날짜</Label>
                <Input
                  id="exam_date"
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">대상 학년</Label>
                <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="대상 학년을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체</SelectItem>
                    <SelectItem value="1학년">1학년</SelectItem>
                    <SelectItem value="2학년">2학년</SelectItem>
                    <SelectItem value="3학년">3학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택사항)</Label>
              <Textarea
                id="description"
                placeholder="시험에 대한 추가 정보를 입력하세요"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingId ? "수정 중..." : "추가 중..."}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {editingId ? "수정하기" : "추가하기"}
                  </>
                )}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  취소
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 시험 일정 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>등록된 시험 일정</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {examSchedules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">등록된 시험 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {examSchedules.map((exam) => {
                const daysUntil = getDaysUntilExam(exam.exam_date)
                return (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{exam.subject}</h3>
                        <Badge variant="outline">{exam.exam_type}</Badge>
                        <Badge variant={exam.grade === "전체" ? "default" : "secondary"}>{exam.grade}</Badge>
                        {daysUntil >= 0 && (
                          <Badge variant={daysUntil <= 7 ? "destructive" : "default"}>D-{daysUntil}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{new Date(exam.exam_date).toLocaleDateString()}</p>
                      {exam.description && <p className="text-sm text-gray-500 mt-1">{exam.description}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(exam)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(exam.id)}>
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
    </div>
  )
}
