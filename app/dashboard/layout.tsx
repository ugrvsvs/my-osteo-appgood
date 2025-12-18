import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { DataProvider } from "@/lib/data-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DataProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:pl-64">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </DataProvider>
  )
}
