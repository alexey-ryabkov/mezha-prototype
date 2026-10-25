import { Navigate, Outlet, Route, Routes } from "react-router"

import { DemoNav } from "@/components/demo/demo-nav"
import { CabinetLayout } from "@/pages/cabinet/cabinet-layout"
import { LoginPage } from "@/pages/cabinet/login-page"
import { JournalPage } from "@/pages/cabinet/journal-page"
import { LeadsPage } from "@/pages/cabinet/leads-page"
import { PlanEditorPage } from "@/pages/cabinet/plan/plan-editor-page"
import { PlotsPage } from "@/pages/cabinet/plots/plots-page"
import { ProfilePage } from "@/pages/cabinet/profile/profile-page"
import { StatsPage } from "@/pages/cabinet/stats-page"
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
          <Route path="plots" element={<PlotsPage />} />
          <Route path="plan" element={<PlanEditorPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
