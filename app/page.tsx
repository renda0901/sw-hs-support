"use client"

import { useState, useEffect } from "react"
import LoginPage from "@/components/login-page"
import Dashboard from "@/components/dashboard"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; grade: string; id: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 확인
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // 사용자 프로필 정보 가져오기
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

        if (profile) {
          setUser({
            name: profile.name,
            grade: profile.grade,
            id: session.user.id,
          })
          setIsLoggedIn(true)
        }
      }
      setIsLoading(false)
    }

    checkSession()

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        setIsLoggedIn(false)
      } else if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

        if (profile) {
          setUser({
            name: profile.name,
            grade: profile.grade,
            id: session.user.id,
          })
          setIsLoggedIn(true)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = (userData: { name: string; grade: string; id: string }) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsLoggedIn(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
