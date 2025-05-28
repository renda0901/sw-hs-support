"use client"

import { useState, useEffect } from "react"
import AdminLogin from "@/components/admin-login"
import AdminDashboard from "@/components/admin-dashboard"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [admin, setAdmin] = useState<{ name: string; email: string; id: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 확인
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // 관리자 권한 확인
        const { data: adminUser, error } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (adminUser) {
          setAdmin({
            name: adminUser.name,
            email: adminUser.email,
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
        setAdmin(null)
        setIsLoggedIn(false)
      } else if (event === "SIGNED_IN" && session?.user) {
        const { data: adminUser, error } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (adminUser) {
          setAdmin({
            name: adminUser.name,
            email: adminUser.email,
            id: session.user.id,
          })
          setIsLoggedIn(true)
        } else {
          // 관리자가 아닌 경우 로그아웃 처리
          await supabase.auth.signOut()
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAdminLogin = (adminData: { name: string; email: string; id: string }) => {
    setAdmin(adminData)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setAdmin(null)
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
    return <AdminLogin onAdminLogin={handleAdminLogin} />
  }

  return <AdminDashboard admin={admin} onLogout={handleLogout} />
}
