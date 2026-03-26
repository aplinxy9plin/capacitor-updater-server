"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

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
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-80 border border-border rounded-lg p-6">
        <h1 className="text-base font-semibold text-center mb-0.5">Capacitor Updater</h1>
        <p className="text-sm text-muted-foreground text-center mb-5">Self-hosted OTA update server</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "..." : isRegister ? "Create Account" : "Sign In"}</Button>
          {regEnabled && !isRegister && (
            <button type="button" onClick={() => setIsRegister(true)} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">Create account</button>
          )}
          {isRegister && (
            <button type="button" onClick={() => setIsRegister(false)} className="text-sm text-muted-foreground hover:text-foreground w-full text-center">Sign in</button>
          )}
        </form>
      </div>
    </div>
  )
}
