"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, BookOpen, LogOut, Plus, Users, Clock, Settings } from "lucide-react"
import ExamScheduleManager from "./exam-schedule-manager"
import AssignmentScheduleManager from "./assignment-schedule-manager"
import SubjectEvaluationManager from "./subject-evaluation-manager"
import { supabase } from "@/lib/supabase"

interface AdminDashboardProps {
  admin: { name: string; email: string; id: string } | null
  onLogout: () => void
}

export default function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalExams: 0,
    totalAssignments: 0,
    upcomingExams: 0,
    upcomingAssignments: 0,
    totalSubjects: 0,
    totalEvaluationTypes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]

      // 전체 시험 수
      const { count: examCount } = await supabase.from("exam_schedules").select("*", { count: "exact", head: true })

      // 전체 수행평가 수
      const { count: assignmentCount } = await supabase
        .from("assignment_schedules")
        .select("*", { count: "exact", head: true })

      // 다가오는 시험 수
      const { count: upcomingExamCount } = await supabase
        .from("exam_schedules")
        .select("*", { count: "exact", head: true })
        .gte("exam_date", today)

      // 다가오는 수행평가 수
      const { count: upcomingAssignmentCount } = await supabase
        .from("assignment_schedules")
        .select("*", { count: "exact", head: true })
        .gte("due_date", today)

      // 과목 수
      const { count: subjectCount } = await supabase
        .from("subjects")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      // 평가 유형 수
      const { count: evaluationCount } = await supabase
        .from("evaluation_types")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      setStats({
        totalExams: examCount || 0,
        totalAssignments: assignmentCount || 0,
        upcomingExams: upcomingExamCount || 0,
        upcomingAssignments: upcomingAssignmentCount || 0,
        totalSubjects: subjectCount || 0,
        totalEvaluationTypes: evaluationCount || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback className="bg-purple-100 text-purple-600">{admin?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{admin?.name}</p>
                <p className="text-gray-500">관리자</p>
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
              <Users className="w-4 h-4" />
              <span>개요</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>과목/평가 관리</span>
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>시험 일정</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>수행평가</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">과목 수</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSubjects}</div>
                  <p className="text-xs text-muted-foreground">등록된 과목</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">평가 유형</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEvaluationTypes}</div>
                  <p className="text-xs text-muted-foreground">등록된 평가 유형</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">전체 시험</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalExams}</div>
                  <p className="text-xs text-muted-foreground">등록된 시험 수</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">전체 수행평가</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAssignments}</div>
                  <p className="text-xs text-muted-foreground">등록된 수행평가 수</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">다가오는 시험</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.upcomingExams}</div>
                  <p className="text-xs text-muted-foreground">예정된 시험</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">다가오는 수행평가</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.upcomingAssignments}</div>
                  <p className="text-xs text-muted-foreground">마감 예정</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 작업</CardTitle>
                <CardDescription>자주 사용하는 기능들</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveTab("subjects")}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Settings className="w-6 h-6" />
                    <span>과목/평가 관리</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("exams")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Calendar className="w-6 h-6" />
                    <span>시험 일정 추가</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("assignments")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <BookOpen className="w-6 h-6" />
                    <span>수행평가 추가</span>
                  </Button>
                  <Button
                    onClick={fetchStats}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Users className="w-6 h-6" />
                    <span>통계 새로고침</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects">
            <SubjectEvaluationManager adminId={admin?.id} />
          </TabsContent>

          <TabsContent value="exams">
            <ExamScheduleManager adminId={admin?.id} onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentScheduleManager adminId={admin?.id} onUpdate={fetchStats} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
