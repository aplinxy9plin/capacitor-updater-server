"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { Zap, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [regEnabled, setRegEnabled] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/v1/settings").then(r => {
      if (!r.ok) { setRegEnabled(true); setIsRegister(true); return }
      return r.json()
    }).then(d => {
      if (d?.registration_enabled === "true") { setRegEnabled(true); setIsRegister(true) }
    }).catch(() => { setRegEnabled(true); setIsRegister(true) })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (isRegister) {
      const { error: err } = await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0],
        callbackURL: "/",
      })
      if (err) {
        setError(err.message ?? "Failed to create account")
        setLoading(false)
        return
      }
    } else {
      const { error: err } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      })
      if (err) {
        setError(err.message ?? "Invalid email or password")
        setLoading(false)
        return
      }
    }

    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Capacitor Updater</h1>
          <p className="text-sm text-muted-foreground">Self-hosted OTA update server</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "..." : isRegister ? "Create Account" : "Sign In"}
          </Button>

          {regEnabled && !isRegister && (
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Create account
            </button>
          )}
          {isRegister && (
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in instead
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
