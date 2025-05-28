"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, TrendingUp, Target, BookOpen, LogOut, Plus, BarChart3, Clock } from "lucide-react"
import GradeInput from "./grade-input"
import GradeHistory from "./grade-history"
import StudyPlanner from "./study-planner"

interface DashboardProps {
  user: { name: string; grade: string } | null
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // 모의 데이터
  const recentGrades = [
    { subject: "국어", score: 85, date: "2024-01-15", type: "중간고사" },
    { subject: "수학", score: 92, date: "2024-01-12", type: "수행평가" },
    { subject: "영어", score: 78, date: "2024-01-10", type: "모의고사" },
  ]

  const upcomingExams = [
    { subject: "국어", date: "2024-02-05", type: "기말고사", daysLeft: 12 },
    { subject: "수학", date: "2024-02-07", type: "기말고사", daysLeft: 14 },
    { subject: "영어", date: "2024-02-10", type: "기말고사", daysLeft: 17 },
  ]

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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">평균 성적</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85.2점</div>
                  <p className="text-xs text-muted-foreground">+2.1% 지난 달 대비</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">목표 달성률</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">3개 과목 중 2개 달성</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">다음 시험</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">D-12</div>
                  <p className="text-xs text-muted-foreground">국어 기말고사</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Grades and Upcoming Exams */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>최근 성적</CardTitle>
                  <CardDescription>최근 입력된 성적 현황</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentGrades.map((grade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{grade.subject}</p>
                          <p className="text-sm text-gray-500">
                            {grade.type} • {grade.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{grade.score}점</p>
                        </div>
                      </div>
                    ))}
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
                    {upcomingExams.map((exam, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{exam.subject}</p>
                          <p className="text-sm text-gray-500">
                            {exam.type} • {exam.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">D-{exam.daysLeft}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="input">
            <GradeInput />
          </TabsContent>

          <TabsContent value="history">
            <GradeHistory />
          </TabsContent>

          <TabsContent value="planner">
            <StudyPlanner />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
