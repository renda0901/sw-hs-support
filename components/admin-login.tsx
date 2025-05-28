"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Shield, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import PasswordReset from "./password-reset"

interface AdminLoginProps {
  onAdminLogin: (adminData: { name: string; email: string; id: string }) => void
}

export default function AdminLogin({ onAdminLogin }: AdminLoginProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setDebugInfo(null)

    try {
      // 1. 일반 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      if (error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.")
        return
      }

      if (data.user) {
        // 2. 관리자 권한 확인
        const { data: adminUser, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (adminError) {
          setDebugInfo(`관리자 조회 오류: ${adminError.message}`)
          await supabase.auth.signOut()
          setError("관리자 권한이 없습니다.")
          return
        }

        if (!adminUser) {
          await supabase.auth.signOut()
          setError("관리자 권한이 없습니다.")
          return
        }

        onAdminLogin({
          name: adminUser.name,
          email: adminUser.email,
          id: data.user.id,
        })
      }
    } catch (err: any) {
      setError("로그인 중 오류가 발생했습니다.")
      setDebugInfo(`오류: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 로그인</h1>
            <p className="text-gray-600 mt-2">시험 및 수행평가 일정 관리</p>
          </div>
          <PasswordReset onBack={() => setShowPasswordReset(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="text-gray-600 mt-2">시험 및 수행평가 일정 관리</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            {debugInfo && <p className="text-xs text-gray-500 mt-1">{debugInfo}</p>}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>관리자 인증</CardTitle>
            <CardDescription>관리자 계정으로 로그인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="관리자 이메일을 입력하세요"
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
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  "관리자 로그인"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
