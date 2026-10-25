import { Navigate, useNavigate, useParams } from "react-router"

import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { USERS, type Role } from "@/data/village"
import { useDemo } from "@/store/demo"

export function LoginPage() {
  const { role } = useParams()
  const navigate = useNavigate()
  const user = useDemo((s) => s.user)
  const login = useDemo((s) => s.login)

  if (role !== "owner" && role !== "manager") return <Navigate to="/" replace />
  if (user === role) return <Navigate to="/cabinet" replace />

  const account = USERS[role as Role]

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/60 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Logo className="mb-4" />
          <CardTitle className="font-heading text-lg">Вход в кабинет</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              login(role as Role)
              navigate("/cabinet")
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Почта</Label>
              <Input id="email" type="email" defaultValue={account.email} autoComplete="off" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" defaultValue="demo-password" autoComplete="off" />
            </div>
            <Button type="submit" className="mt-2 w-full">
              Войти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
