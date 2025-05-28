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
import { BookOpen, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AssignmentScheduleManagerProps {
  adminId?: string
  onUpdate?: () => void
}

interface AssignmentSchedule {
  id: string
  subject: string
  assignment_name: string
  assignment_type: string
  due_date: string
  description: string | null
  grade: string
  max_score: number | null
  created_at: string
}

export default function AssignmentScheduleManager({ adminId, onUpdate }: AssignmentScheduleManagerProps) {
  const [assignmentSchedules, setAssignmentSchedules] = useState<AssignmentSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    subject: "",
    assignment_name: "",
    assignment_type: "",
    due_date: "",
    description: "",
    grade: "",
    max_score: "100",
  })

  useEffect(() => {
    fetchAssignmentSchedules()
  }, [])

  const fetchAssignmentSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("assignment_schedules")
        .select("*")
        .order("due_date", { ascending: true })

      if (error) {
        setError("수행평가 일정을 불러올 수 없습니다.")
        return
      }

      setAssignmentSchedules(data || [])
    } catch (err) {
      setError("수행평가 일정을 불러올 수 없습니다.")
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
          .from("assignment_schedules")
          .update({
            subject: formData.subject,
            assignment_name: formData.assignment_name,
            assignment_type: formData.assignment_type,
            due_date: formData.due_date,
            description: formData.description || null,
            grade: formData.grade,
            max_score: Number.parseInt(formData.max_score) || 100,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) {
          setError("수행평가 일정 수정 중 오류가 발생했습니다.")
          return
        }

        setSuccess("수행평가 일정이 수정되었습니다.")
        setEditingId(null)
      } else {
        // 새로 추가
        const { error } = await supabase.from("assignment_schedules").insert({
          subject: formData.subject,
          assignment_name: formData.assignment_name,
          assignment_type: formData.assignment_type,
          due_date: formData.due_date,
          description: formData.description || null,
          grade: formData.grade,
          max_score: Number.parseInt(formData.max_score) || 100,
          created_by: adminId,
        })

        if (error) {
          setError("수행평가 일정 추가 중 오류가 발생했습니다.")
          return
        }

        setSuccess("수행평가 일정이 추가되었습니다.")
      }

      // 폼 초기화
      setFormData({
        subject: "",
        assignment_name: "",
        assignment_type: "",
        due_date: "",
        description: "",
        grade: "",
        max_score: "100",
      })

      fetchAssignmentSchedules()
      onUpdate?.()
    } catch (err) {
      setError("오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (assignment: AssignmentSchedule) => {
    setFormData({
      subject: assignment.subject,
      assignment_name: assignment.assignment_name,
      assignment_type: assignment.assignment_type,
      due_date: assignment.due_date,
      description: assignment.description || "",
      grade: assignment.grade,
      max_score: assignment.max_score?.toString() || "100",
    })
    setEditingId(assignment.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      const { error } = await supabase.from("assignment_schedules").delete().eq("id", id)

      if (error) {
        setError("삭제 중 오류가 발생했습니다.")
        return
      }

      setSuccess("수행평가 일정이 삭제되었습니다.")
      fetchAssignmentSchedules()
      onUpdate?.()
    } catch (err) {
      setError("삭제 중 오류가 발생했습니다.")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({
      subject: "",
      assignment_name: "",
      assignment_type: "",
      due_date: "",
      description: "",
      grade: "",
      max_score: "100",
    })
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
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
      {/* 수행평가 일정 추가/수정 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>{editingId ? "수행평가 일정 수정" : "새 수행평가 일정 추가"}</span>
          </CardTitle>
          <CardDescription>
            {editingId ? "수행평가 일정을 수정하세요" : "새로운 수행평가 일정을 등록하세요"}
          </CardDescription>
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
                <Label htmlFor="assignment_type">수행평가 유형</Label>
                <Select
                  value={formData.assignment_type}
                  onValueChange={(value) => setFormData({ ...formData, assignment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="수행평가 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="독서 논술">독서 논술</SelectItem>
                    <SelectItem value="매체 논술">매체 논술</SelectItem>
                    <SelectItem value="발표">발표</SelectItem>
                    <SelectItem value="프로젝트">프로젝트</SelectItem>
                    <SelectItem value="실험">실험</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_name">수행평가 제목</Label>
              <Input
                id="assignment_name"
                placeholder="수행평가 제목을 입력하세요"
                value={formData.assignment_name}
                onChange={(e) => setFormData({ ...formData, assignment_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">마감 날짜</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
              <div className="space-y-2">
                <Label htmlFor="max_score">만점</Label>
                <Input
                  id="max_score"
                  type="number"
                  placeholder="100"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택사항)</Label>
              <Textarea
                id="description"
                placeholder="수행평가에 대한 추가 정보를 입력하세요"
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

      {/* 수행평가 일정 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>등록된 수행평가 일정</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignmentSchedules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">등록된 수행평가 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignmentSchedules.map((assignment) => {
                const daysUntil = getDaysUntilDue(assignment.due_date)
                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{assignment.assignment_name}</h3>
                        <Badge variant="outline">{assignment.subject}</Badge>
                        <Badge variant="secondary">{assignment.assignment_type}</Badge>
                        <Badge variant={assignment.grade === "전체" ? "default" : "secondary"}>
                          {assignment.grade}
                        </Badge>
                        {daysUntil >= 0 && (
                          <Badge variant={daysUntil <= 3 ? "destructive" : "default"}>D-{daysUntil}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        마감: {new Date(assignment.due_date).toLocaleDateString()} | 만점: {assignment.max_score}점
                      </p>
                      {assignment.description && <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(assignment)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(assignment.id)}>
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
