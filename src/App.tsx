import { Navigate, Outlet, Route, Routes } from "react-router"

import { DemoNav } from "@/components/demo/demo-nav"
import { CabinetLayout } from "@/pages/cabinet/cabinet-layout"
import { LoginPage } from "@/pages/cabinet/login-page"
import { CABINET_SECTIONS } from "@/pages/cabinet/nav"
import { PlaceholderPage } from "@/pages/cabinet/placeholder-page"
import { DemoMenuPage } from "@/pages/demo-menu-page"
import { WidgetPage } from "@/pages/widget/widget-page"

function WithDemoNav() {
  return (
    <>
      <Outlet />
      <DemoNav />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DemoMenuPage />} />
      <Route element={<WithDemoNav />}>
        <Route path="/widget" element={<WidgetPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/cabinet" element={<CabinetLayout />}>
          <Route index element={<Navigate to="plots" replace />} />
          {CABINET_SECTIONS.map((s) => (
            <Route key={s.path} path={s.path} element={<PlaceholderPage title={s.label} />} />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
