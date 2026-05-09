import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, UserCheck, BarChart3, ShieldAlert } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Overview' }

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Aggregate stats — no private data
  const [profilesRes] = await Promise.all([
    supabase.from('profiles').select('id, role, created_at'),
  ])

  const profiles = profilesRes.data ?? []
  const totalUsers  = profiles.filter(p => p.role === 'USER').length
  const totalAdmins = profiles.filter(p => p.role === 'ADMIN').length

  // New users this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const newThisMonth = profiles.filter(p => p.created_at >= monthStart).length

  const cards = [
    { title: 'Total Users',     value: totalUsers,     icon: Users,       color: 'text-primary',   bg: 'bg-primary/10' },
    { title: 'Admins',          value: totalAdmins,    icon: ShieldAlert,  color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { title: 'New This Month',  value: newThisMonth,   icon: UserCheck,   color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Total Accounts',  value: profiles.length, icon: BarChart3,  color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Admin Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Platform-wide statistics — no private user data is exposed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.title}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Privacy notice */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Admin Privacy Policy</p>
          <p className="text-xs text-muted-foreground mt-1">
            Admin accounts can view registered users and aggregate statistics only.
            Individual wallet balances, transaction amounts, and personal financial data
            are strictly inaccessible — enforced at the database level via Row Level Security.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <a href="/admin/users" className="text-sm text-primary hover:underline font-medium">
          View all users →
        </a>
      </div>
    </div>
  )
}
