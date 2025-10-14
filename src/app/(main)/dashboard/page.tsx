import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Welcome, {session.user?.name}</h1>
      <p className="text-gray-400">Dashboard coming soon...</p>
    </div>
  )
}