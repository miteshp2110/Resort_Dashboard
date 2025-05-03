"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

type User = {
  id: number
  username: string
  full_name: string
  email: string
  role: "admin" | "reception" | "kitchen"
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      if (!token && pathname !== "/login") {
        router.push("/login")
      } else if (token && pathname === "/login") {
        router.push("/dashboard")
      }
    }
  }, [token, pathname, isLoading, router])

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await fetch("https://playlist-backend.tech/resort/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      setToken(data.token)
      setUser(data.user)

      // Store in localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/dashboard")
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.full_name}!`,
      })
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
