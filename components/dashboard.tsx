"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, TrendingUp, Target, BookOpen, LogOut, Plus, BarChart3, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import GradeInput from "./grade-input"
import GradeHistory from "./grade-history"
import StudyPlanner from "./study-planner"
import { supabase } from "@/lib/supabaseClient"

interface DashboardProps {
  user: { name: string; grade: string; id: string } | null
  onLogout: () => void
}

interface ExamSchedule {
  id: string
  subject: string
  exam_type: string
  exam_date: string
  description: string | null
  grade: string
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
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [recentGrades, setRecentGrades] = useState<any[]>([])
  const [averageScore, setAverageScore] = useState<number>(0)
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([])
  const [assignmentSchedules, setAssignmentSchedules] = useState<AssignmentSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchUserStats()
      fetchSchedules()
    }
  }, [user?.id])

  const fetchUserStats = async () => {
    try {
      const { data: grades } = await supabase
        .from("grades")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(3)

      if (grades) {
        setRecentGrades(grades)

        // 평균 계산
        if (grades.length > 0) {
          const total = grades.reduce((sum, grade) => sum + grade.final_score, 0)
          setAverageScore(total / grades.length)
        }
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSchedules = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      // 시험 일정 가져오기 (사용자 학년에 맞는 것 + 전체)
      const { data: exams } = await supabase
        .from("exam_schedules")
        .select("*")
        .or(`grade.eq.전체,grade.eq.${user?.grade}`)
        .gte("exam_date", today)
        .order("exam_date", { ascending: true })
        .limit(5)

      // 수행평가 일정 가져오기 (사용자 학년에 맞는 것 + 전체)
      const { data: assignments } = await supabase
        .from("assignment_schedules")
        .select("*")
        .or(`grade.eq.전체,grade.eq.${user?.grade}`)
        .gte("due_date", today)
        .order("due_date", { ascending: true })
        .limit(5)

      setExamSchedules(exams || [])
      setAssignmentSchedules(assignments || [])
    } catch (error) {
      console.error("Error fetching schedules:", error)
    }
  }

  const getDaysUntil = (dateString: string) => {
    const today = new Date()
    const targetDate = new Date(dateString)
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getNextExam = () => {
    if (examSchedules.length === 0) return null
    return examSchedules[0]
  }

  const getUrgentItems = () => {
    const urgent = []

    // 7일 이내 시험
    examSchedules.forEach((exam) => {
      const days = getDaysUntil(exam.exam_date)
      if (days <= 7) {
        urgent.push({
          type: "exam",
          title: `${exam.subject} ${exam.exam_type}`,
          date: exam.exam_date,
          days,
          subject: exam.subject,
        })
      }
    })

    // 3일 이내 수행평가
    assignmentSchedules.forEach((assignment) => {
      const days = getDaysUntil(assignment.due_date)
      if (days <= 3) {
        urgent.push({
          type: "assignment",
          title: assignment.assignment_name,
          date: assignment.due_date,
          days,
          subject: assignment.subject,
        })
      }
    })

    return urgent.sort((a, b) => a.days - b.days)
  }

  const nextExam = getNextExam()
  const urgentItems = getUrgentItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">StudyTracker</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-gray-500">{user?.grade}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>대시보드</span>
            </TabsTrigger>
            <TabsTrigger value="input" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>성적 입력</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>성적 기록</span>
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>학습 계획</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 긴급 알림 */}
            {urgentItems.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-800">
                    <AlertCircle className="w-5 h-5" />
                    <span>긴급 알림</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {urgentItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                      >
                        <div>
                          <p className="font-medium text-orange-900">{item.title}</p>
                          <p className="text-sm text-orange-700">
                            {item.subject} • {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={item.days <= 1 ? "destructive" : "default"}>D-{item.days}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* D-Day 카운터 */}
            {nextExam && (
              <div className="flex items-center justify-center py-6">
                <Card className="w-full max-w-md text-center">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-blue-600 mb-2">D-{getDaysUntil(nextExam.exam_date)}</div>
                    <p className="text-lg font-medium">
                      {nextExam.subject} {nextExam.exam_type}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(nextExam.exam_date).toLocaleDateString()}</p>
                    {nextExam.description && <p className="text-xs text-gray-400 mt-2">{nextExam.description}</p>}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">평균 성적</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageScore.toFixed(1)}점</div>
                  <p className="text-xs text-muted-foreground">전체 과목 평균</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">다가오는 시험</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{examSchedules.length}</div>
                  <p className="text-xs text-muted-foreground">예정된 시험</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">수행평가</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignmentSchedules.length}</div>
                  <p className="text-xs text-muted-foreground">마감 예정</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Grades and Schedules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>최근 성적</CardTitle>
                  <CardDescription>최근 입력된 성적 현황</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentGrades.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">아직 입력된 성적이 없습니다.</p>
                    ) : (
                      recentGrades.map((grade, index) => (
                        <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{grade.subject}</p>
                            <p className="text-sm text-gray-500">
                              {grade.exam_type} • {new Date(grade.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{grade.final_score.toFixed(1)}점</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>다가오는 시험</CardTitle>
                  <CardDescription>예정된 시험 일정</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examSchedules.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">예정된 시험이 없습니다.</p>
                    ) : (
                      examSchedules.map((exam) => {
                        const daysUntil = getDaysUntil(exam.exam_date)
                        return (
                          <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{exam.subject}</p>
                              <p className="text-sm text-gray-500">
                                {exam.exam_type} • {new Date(exam.exam_date).toLocaleDateString()}
                              </p>
                              {exam.description && <p className="text-xs text-gray-400 mt-1">{exam.description}</p>}
                            </div>
                            <div className="text-right">
                              <Badge variant={daysUntil <= 7 ? "destructive" : "default"}>D-{daysUntil}</Badge>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assignment Schedules */}
            {assignmentSchedules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>다가오는 수행평가</CardTitle>
                  <CardDescription>마감 예정인 수행평가</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignmentSchedules.map((assignment) => {
                      const daysUntil = getDaysUntil(assignment.due_date)
                      return (
                        <div key={assignment.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium">{assignment.assignment_name}</h3>
                            <Badge variant={daysUntil <= 3 ? "destructive" : "default"}>D-{daysUntil}</Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              {assignment.subject} • {assignment.assignment_type}
                            </p>
                            <p className="text-sm text-gray-500">
                              마감: {new Date(assignment.due_date).toLocaleDateString()}
                            </p>
                            {assignment.max_score && (
                              <p className="text-sm text-gray-500">만점: {assignment.max_score}점</p>
                            )}
                            {assignment.description && (
                              <p className="text-xs text-gray-400 mt-2">{assignment.description}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="input">
            <GradeInput userId={user?.id} />
          </TabsContent>

          <TabsContent value="history">
            <GradeHistory userId={user?.id} />
          </TabsContent>

          <TabsContent value="planner">
            <StudyPlanner userId={user?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
