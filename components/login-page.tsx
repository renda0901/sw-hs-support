"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import PasswordReset from "./password-reset"

interface LoginPageProps {
  onLogin: (userData: { name: string; grade: string; id: string }) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<string>("login")
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.")
        return
      }

      if (data.user) {
        // 사용자 프로필 정보 가져오기
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          setError("프로필 정보를 불러올 수 없습니다.")
          return
        }

        onLogin({
          name: profile.name,
          grade: profile.grade,
          id: data.user.id,
        })
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (signupData.password !== signupData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      setIsLoading(false)
      return
    }

    if (signupData.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.")
      setIsLoading(false)
      return
    }

    if (!signupData.name.trim()) {
      setError("이름을 입력해주세요.")
      setIsLoading(false)
      return
    }

    if (!signupData.grade) {
      setError("학년을 선택해주세요.")
      setIsLoading(false)
      return
    }

    try {
      // 1. 사용자 계정 생성 (이메일 확인 비활성화)
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: undefined, // 이메일 확인 비활성화
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          setError("이미 등록된 이메일입니다.")
        } else if (error.message.includes("Invalid email")) {
          setError("올바른 이메일 주소를 입력해주세요.")
        } else {
          setError(`회원가입 오류: ${error.message}`)
        }
        return
      }

      if (data.user) {
        // 사용자가 완전히 생성될 때까지 잠시 대기
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // 2. 사용자가 실제로 존재하는지 확인
        const { data: authUser, error: authError } = await supabase.auth.getUser()

        if (authError || !authUser.user) {
          // 수동으로 로그인 시도
          const { data: loginResult, error: loginError } = await supabase.auth.signInWithPassword({
            email: signupData.email,
            password: signupData.password,
          })

          if (loginError) {
            setError("계정이 생성되었지만 로그인에 실패했습니다. 로그인 탭에서 다시 시도해주세요.")
            return
          }

          if (!loginResult.user) {
            setError("계정 생성 중 오류가 발생했습니다. 다시 시도해주세요.")
            return
          }

          // 로그인 성공 후 프로필 생성
          const { error: profileError } = await supabase.from("user_profiles").insert({
            id: loginResult.user.id,
            name: signupData.name.trim(),
            grade: signupData.grade,
          })

          if (profileError) {
            console.error("Profile creation error:", profileError)
            setError("프로필 생성 중 오류가 발생했습니다. 다시 시도해주세요.")
            return
          }

          onLogin({
            name: signupData.name,
            grade: signupData.grade,
            id: loginResult.user.id,
          })
        } else {
          // 인증된 사용자로 프로필 생성
          const { error: profileError } = await supabase.from("user_profiles").insert({
            id: authUser.user.id,
            name: signupData.name.trim(),
            grade: signupData.grade,
          })

          if (profileError) {
            console.error("Profile creation error:", profileError)
            setError("프로필 생성 중 오류가 발생했습니다. 다시 시도해주세요.")
            return
          }

          onLogin({
            name: signupData.name,
            grade: signupData.grade,
            id: authUser.user.id,
          })
        }
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">StudyTracker</h1>
            <p className="text-gray-600 mt-2">고등학교 성적 관리 시스템</p>
          </div>
          <PasswordReset onBack={() => setShowPasswordReset(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">StudyTracker</h1>
          <p className="text-gray-600 mt-2">고등학교 성적 관리 시스템</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>로그인</CardTitle>
                <CardDescription>계정에 로그인하여 성적을 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">비밀번호</Label>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() => setShowPasswordReset(true)}
                        type="button"
                      >
                        비밀번호 찾기
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        로그인 중...
                      </>
                    ) : (
                      "로그인"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>회원가입</CardTitle>
                <CardDescription>새 계정을 만들어 바로 시작하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      placeholder="이름을 입력하세요"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">학년</Label>
                    <Select
                      value={signupData.grade}
                      onValueChange={(value) => setSignupData({ ...signupData, grade: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="학년을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1학년">1학년</SelectItem>
                        <SelectItem value="2학년">2학년</SelectItem>
                        <SelectItem value="3학년">3학년</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">이메일</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">비밀번호</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="비밀번호를 입력하세요 (6자 이상)"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">비밀번호 확인</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        가입 중...
                      </>
                    ) : (
                      "회원가입"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
